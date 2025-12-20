import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Diagnostic endpoint to test Supabase connection and table access
 * GET /api/questionnaire/test-db
 */
export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    // Check 1: Environment Variables
    results.checks.envVars = {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    };

    // Check 2: Create Supabase Client
    let supabase;
    try {
      supabase = createServerSupabaseClient(true);
      results.checks.clientCreation = { success: true };
    } catch (error) {
      results.checks.clientCreation = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
      return NextResponse.json(results, { status: 500 });
    }

    // Check 3: Test Table Existence
    try {
      const { error } = await (supabase as any)
        .from('questionnaire_responses')
        .select('id')
        .limit(1);

      if (error) {
        results.checks.tableAccess = {
          success: false,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint,
        };
      } else {
        results.checks.tableAccess = {
          success: true,
          canRead: true,
        };
      }
    } catch (error) {
      results.checks.tableAccess = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Check 4: Test Insert (with rollback)
    try {
      const testPayload = {
        first_name: 'Test',
        last_name: 'Diagnostic',
        business_email: 'test-diagnostic@example.com',
        business_phone: '+61400000000',
        business_name: 'Test Company',
        sector: 'healthcare',
        pain_points: [] as any[],
        challenges: [] as any[],
        status: 'submitted',
      };

      const { data, error } = await (supabase as any)
        .from('questionnaire_responses')
        .insert(testPayload)
        .select('id')
        .single();

      if (error) {
        results.checks.insertTest = {
          success: false,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint,
          fullError: JSON.stringify(error, null, 2),
          payload: testPayload,
        };
      } else {
        results.checks.insertTest = {
          success: true,
          insertedId: data?.id,
        };

        // Clean up test record
        if (data?.id) {
          await (supabase as any)
            .from('questionnaire_responses')
            .delete()
            .eq('id', data.id);
        }
      }
    } catch (error) {
      results.checks.insertTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Check 5: Check RLS Status
    try {
      const { data: rlsData, error: rlsError } = await (supabase as any).rpc('exec_sql', {
        query: `
          SELECT tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
            AND tablename = 'questionnaire_responses';
        `,
      });

      if (!rlsError && rlsData) {
        results.checks.rlsStatus = {
          success: true,
          data: rlsData,
        };
      } else {
        // Try direct query instead
        results.checks.rlsStatus = {
          note: 'Cannot check RLS via RPC, check manually in Supabase SQL Editor',
        };
      }
    } catch (error) {
      results.checks.rlsStatus = {
        note: 'Cannot check RLS programmatically',
      };
    }

    // Summary
    const allChecksPassed = 
      results.checks.envVars?.hasServiceRoleKey &&
      results.checks.clientCreation?.success &&
      results.checks.tableAccess?.success &&
      results.checks.insertTest?.success;

    results.summary = {
      allChecksPassed,
      status: allChecksPassed ? 'OK' : 'ISSUES FOUND',
    };

    return NextResponse.json(results, {
      status: allChecksPassed ? 200 : 500,
    });
  } catch (error) {
    results.error = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    return NextResponse.json(results, { status: 500 });
  }
}
