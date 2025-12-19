'use client';

import Script from 'next/script';

/**
 * ChatWidget Component
 * 
 * Embeds chat widget provider script (Drift/Intercom/Crisp) on all pages.
 * Supports environment-based toggling via NEXT_PUBLIC_CHAT_WIDGET_ENV.
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_CHAT_WIDGET_ENV: 'development' | 'staging' | 'production'
 * - NEXT_PUBLIC_CHAT_WIDGET_PROVIDER: 'drift' | 'intercom' | 'crisp'
 * - NEXT_PUBLIC_DRIFT_ID: Drift widget ID (if using Drift)
 * - NEXT_PUBLIC_INTERCOM_APP_ID: Intercom app ID (if using Intercom)
 * - NEXT_PUBLIC_CRISP_WEBSITE_ID: Crisp website ID (if using Crisp)
 */
export default function ChatWidget() {
  const widgetEnv = process.env.NEXT_PUBLIC_CHAT_WIDGET_ENV || 'production';
  const widgetProvider = process.env.NEXT_PUBLIC_CHAT_WIDGET_PROVIDER || 'drift';

  // Only show widget in production (or if explicitly enabled)
  const isEnabled = widgetEnv === 'production' || widgetEnv === 'staging';

  if (!isEnabled) {
    return null;
  }

  // Drift Widget
  if (widgetProvider === 'drift') {
    const driftId = process.env.NEXT_PUBLIC_DRIFT_ID;
    
    if (!driftId) {
      console.warn('[ChatWidget] NEXT_PUBLIC_DRIFT_ID not set - chat widget disabled');
      return null;
    }

    return (
      <Script
        id="drift-widget-script"
        strategy="afterInteractive"
        src={`https://js.driftt.com/include/${driftId}/latest.js`}
      />
    );
  }

  // Intercom Widget
  if (widgetProvider === 'intercom') {
    const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

    if (!intercomAppId) {
      console.warn('[ChatWidget] NEXT_PUBLIC_INTERCOM_APP_ID not set - chat widget disabled');
      return null;
    }

    return (
      <>
        <Script
          id="intercom-settings"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.intercomSettings = {
                app_id: "${intercomAppId}"
              };
            `,
          }}
        />
        <Script
          id="intercom-widget-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var w=window;var ic=w.Intercom;if(typeof ic==="function"){
                  ic('reattach_activator');ic('update',w.intercomSettings);
                }else{
                  var d=document;var i=function(){i.c(arguments);};i.q=[];
                  i.c=function(args){i.q.push(args);};w.Intercom=i;
                  var l=function(){var s=d.createElement('script');
                  s.type='text/javascript';s.async=true;
                  s.src='https://widget.intercom.io/widget/${intercomAppId}';
                  var x=d.getElementsByTagName('script')[0];
                  x.parentNode.insertBefore(s,x);};
                  if(document.readyState==='complete'){l();}
                  else if(w.attachEvent){w.attachEvent('onload',l);}
                  else{w.addEventListener('load',l,false);}
                }
              })();
            `,
          }}
        />
      </>
    );
  }

  // Crisp Widget
  if (widgetProvider === 'crisp') {
    const crispWebsiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

    if (!crispWebsiteId) {
      console.warn('[ChatWidget] NEXT_PUBLIC_CRISP_WEBSITE_ID not set - chat widget disabled');
      return null;
    }

    return (
      <Script
        id="crisp-chat-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="${crispWebsiteId}";
            (function(){
              var d=document;
              var s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `,
        }}
      />
    );
  }

  // Unknown provider
  console.warn(`[ChatWidget] Unknown provider: ${widgetProvider}. Supported: drift, intercom, crisp`);
  return null;
}
