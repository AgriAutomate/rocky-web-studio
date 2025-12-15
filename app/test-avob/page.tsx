import { AVOBBadge, AVOBBadgeWithText } from '@/components/ui';

export default function TestAVOB() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        <h1 className="text-3xl font-bold text-foreground">AVOB Badge Component Test</h1>

        {/* Basic Badge Tests */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Basic Badge Variants</h2>
          <div className="flex flex-wrap items-center gap-8 p-6 bg-card rounded-lg shadow">
            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">Standard, Medium</p>
              <AVOBBadge variant="standard" size="medium" />
            </div>
            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">Defense Force, Medium</p>
              <AVOBBadge variant="defense-force" size="medium" />
            </div>
          </div>
        </section>

        {/* Size Variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Size Variants</h2>
          <div className="flex flex-wrap items-center gap-8 p-6 bg-card rounded-lg shadow">
            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">Small</p>
              <AVOBBadge variant="defense-force" size="small" />
            </div>
            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">Medium</p>
              <AVOBBadge variant="defense-force" size="medium" />
            </div>
            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">Large</p>
              <AVOBBadge variant="defense-force" size="large" />
            </div>
          </div>
        </section>

        {/* With Link vs Without Link */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Link Options</h2>
          <div className="flex flex-wrap items-center gap-8 p-6 bg-card rounded-lg shadow">
            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">With Link (default)</p>
              <AVOBBadge variant="defense-force" size="medium" link={true} />
            </div>
            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">Without Link</p>
              <AVOBBadge variant="defense-force" size="medium" link={false} />
            </div>
          </div>
        </section>

        {/* Badge With Text */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Badge With Text</h2>
          <div className="flex flex-wrap items-center gap-8 p-6 bg-card rounded-lg shadow">
            <AVOBBadgeWithText variant="defense-force" size="medium" />
            <AVOBBadgeWithText variant="standard" size="large" />
          </div>
        </section>

        {/* Custom Styling */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Custom Styling</h2>
          <div className="flex flex-wrap items-center gap-8 p-6 bg-card rounded-lg shadow">
            <AVOBBadge 
              variant="defense-force" 
              size="medium" 
              className="border-2 border-primary rounded-lg p-2"
            />
            <AVOBBadge 
              variant="standard" 
              size="large" 
              className="opacity-75"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

