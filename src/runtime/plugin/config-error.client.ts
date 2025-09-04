import { defineNuxtPlugin, useRuntimeConfig } from '#imports';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public?.enfyraSDK;
  
  if (config?.configError) {
    if (typeof window !== 'undefined' && document) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showError);
      } else {
        showError();
      }
      
      function showError() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'enfyra-config-error';
        errorDiv.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
          background: white;
          padding: 40px;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        content.innerHTML = `
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="margin-right: 12px;">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h1 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 600;">
              Configuration Error
            </h1>
          </div>
          
          <div style="color: #4b5563; margin-bottom: 24px; line-height: 1.6;">
            <p style="margin: 0 0 16px 0; font-size: 16px;">
              <strong>Enfyra SDK</strong> is not configured properly.
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ${config?.configErrorMessage || 'Missing required configuration'}
            </p>
          </div>
          
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
              Add to your nuxt.config.ts:
            </p>
            <pre style="margin: 0; background: #1f2937; color: #f3f4f6; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 14px; line-height: 1.4;"><code>export default defineNuxtConfig({
  modules: ["@enfyra/sdk-nuxt"],
  enfyraSDK: {
    <span style="color: #fbbf24;">apiUrl</span>: <span style="color: #34d399;">"https://your-api-url"</span>
  }
})</code></pre>
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button onclick="location.reload()" style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background 0.2s;
            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
              Reload Page
            </button>
            <button onclick="document.getElementById('enfyra-config-error').style.display='none'" style="
              background: #f3f4f6;
              color: #4b5563;
              border: 1px solid #e5e7eb;
              padding: 10px 20px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
              Dismiss
            </button>
          </div>
        `;
        
        errorDiv.appendChild(content);
        document.body.appendChild(errorDiv);
        
        console.error(
          '%c⚠️ Enfyra SDK Configuration Error',
          'color: #ef4444; font-size: 16px; font-weight: bold;',
          '\n\n' + (config?.configErrorMessage || 'Missing required configuration') +
          '\n\nPlease add the following to your nuxt.config.ts:\n\n' +
          'enfyraSDK: {\n  apiUrl: "https://your-api-url"\n}'
        );
      }
    }
  }
});