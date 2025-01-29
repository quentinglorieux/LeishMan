<script>
  import { Progressbar } from '@sveltia/ui';
  import DOMPurify from 'isomorphic-dompurify';
  import { marked } from 'marked';
  import { _ } from 'svelte-i18n';
  import SveltiaLogo from '$lib/assets/sveltia-logo.svg?raw&inline';
  import SignIn from '$lib/components/entrance/sign-in.svelte';
  import { announcedPageStatus } from '$lib/services/app/navigation';
  import { inAuthPopup } from '$lib/services/backends/shared/auth';
  import { siteConfig, siteConfigError } from '$lib/services/config';
  import { dataLoaded, dataLoadedProgress } from '$lib/services/contents';
  import { user } from '$lib/services/user';
  import { signInError, unauthenticated } from '$lib/services/user/auth';
  import { prefs, prefsError } from '$lib/services/user/prefs';
  import { userRole } from "$lib/services/user/role";


  $effect(() => {
    $announcedPageStatus = $_('welcome_to_sveltia_cms');
  });
</script>

<div role="none" class="container" inert={$user && $dataLoaded}>
  <div role="none" class="inner">
    {#if $siteConfig || $siteConfigError}
      {@const logoURL = $siteConfig?.logo_url}
      <img src={logoURL || `data:image/svg+xml;base64,${btoa(SveltiaLogo)}`} alt="" class="logo" />
    {/if}

    {#if $userRole === "admin"}
  <div class="admin-section">
    <h2>🔧 Admin Controls</h2>
  </div>
{:else if $userRole === "editor"}
  <div class="editor-section">
    <h2>✍️ Editor Controls</h2>
  </div>
{:else if $userRole === "viewer"}
  <div class="viewer-section">
    <h2>👀 Viewer Mode</h2>
  </div>
{:else}
  <p>🔒 You are not logged in.</p>
{/if}


    <h1> Rubidium CMS for Leishman</h1>
    {#if $siteConfigError}
      <div role="alert" class="message">
        {$siteConfigError.message}
        {$_('config.error.try_again')}
      </div>
    {:else if $prefsError}
      <div role="alert" class="message">
        {$_(`prefs.error.${$prefsError.type}`)}
      </div>
    {:else if !$siteConfig || !$prefs}
      <div role="alert" class="message">{$_('loading_site_config')}</div>
    {:else if $signInError.message && !$signInError.canRetry}
      <div role="alert">
        <div role="none" class="message">{$_('loading_site_data_error')}</div>
        <div role="none" class="error">
          {@html DOMPurify.sanitize(
            /** @type {string} */ (marked.parseInline($signInError.message)),
            { ALLOWED_TAGS: ['a', 'code'], ALLOWED_ATTR: ['href'] },
          )}
        </div>
      </div>
    {:else if $inAuthPopup}
      <div role="alert" class="message">{$_('authorizing')}</div>
    {:else if !$user || $unauthenticated}
      <SignIn />
    {:else if !$dataLoaded}
      <div role="alert" class="message">{$_('loading_site_data')}</div>
      {#if $dataLoadedProgress !== undefined}
        <Progressbar now={$dataLoadedProgress} />
      {/if}
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    position: absolute;
    inset: 0;
    z-index: 101;
    flex: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 32px;
    transition: filter 250ms;

    &[inert] {
      filter: opacity(0);
    }

    .inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      min-width: 240px;
      max-width: 800px;
      min-height: 240px;
    }

    .logo {
      max-width: 160px;
      height: auto;
    }

    h1 {
      font-size: 48px;
    }

    .logo ~ h1 {
      font-size: var(--sui-font-size-xxx-large);
    }

    :global(.message) {
      margin: 0 0 16px;
      font-size: var(--sui-font-size-large);
      font-weight: var(--sui-font-weight-normal);
      text-align: center;
    }

    .error {
      border-radius: var(--sui-control-medium-border-radius);
      padding: 12px;
      background-color: var(--sui-secondary-background-color);
      font-size: var(--sui-font-size-default);
      line-height: 1.5;
      text-align: center;
    }
  }
</style>
