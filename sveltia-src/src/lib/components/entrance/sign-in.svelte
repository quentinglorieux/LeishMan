<script>
  import { Button, Icon, PromptDialog, Spacer } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { allBackendServices } from '$lib/services/backends';
  import { cmsConfig } from '$lib/services/config';
  import {
    signInAutomatically,
    signInError,
    signingIn,
    signInManually,
  } from '$lib/services/user/auth';
  import { makeLink } from '$lib/services/utils/string';

  /**
   * @import { GitBackend } from '$lib/types/public';
   */

  let isLocalHost = $state(false);
  let isLocalBackendSupported = $state(false);
  let isBrave = $state(false);
  let showTokenDialog = $state(false);
  let token = $state('');

  const DEFAULT_ORCID_AUTH_URL =
    'https://orcid-sveltia.quentin-glorieux.workers.dev/auth/orcid';
  const DEFAULT_ORCID_ORIGIN = 'https://orcid-sveltia.quentin-glorieux.workers.dev';

  const configuredBackendName = $derived(/** @type {string} */ ($cmsConfig?.backend?.name));
  const configuredBackend = $derived(
    configuredBackendName ? allBackendServices[configuredBackendName] : null,
  );
  const isTestRepo = $derived(configuredBackendName === 'test-repo');
  const repositoryName = $derived(
    isTestRepo
      ? undefined
      : /** @type {GitBackend} */ ($cmsConfig?.backend)?.repo?.split('/').pop(),
  );
  const showLocalBackendOption = $derived(isLocalHost && !isTestRepo);

  const openCenteredPopup = (url, name, w = 600, h = 800) => {
    const y = window.top.outerHeight / 2 + window.top.screenY - h / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - w / 2;

    return window.open(
      url,
      name,
      `width=${w},height=${h},left=${x},top=${y},resizable,scrollbars`,
    );
  };

  const getOrcidConfig = () => {
    const cfg = $cmsConfig?.sveltia?.orcid ?? {};
    const authURL = cfg.authURL || DEFAULT_ORCID_AUTH_URL;
    const origin = cfg.origin || DEFAULT_ORCID_ORIGIN;

    return { authURL, origin };
  };

  const signInWithOrcid = () => {
    const { authURL } = getOrcidConfig();
    openCenteredPopup(authURL, 'orcid-auth');
  };

  onMount(() => {
    const { hostname } = window.location;

    // Local editing needs a secure context, either `http://localhost` or `http://*.localhost`
    // https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
    isLocalHost =
      hostname === '127.0.0.1' || hostname === 'localhost' || hostname.endsWith('.localhost');
    isLocalBackendSupported = 'showDirectoryPicker' in window;
    isBrave = navigator.userAgentData?.brands.some(({ brand }) => brand === 'Brave') ?? false;

    signInAutomatically();

    const onMessage = (event) => {
      const { origin } = getOrcidConfig();

      if (event.origin !== origin) {
        return;
      }

      const d = event?.data || {};

      if (d.backendName === 'github' && d.token) {
        try {
          localStorage.setItem(
            'sveltia-cms.user',
            JSON.stringify({
              backendName: 'github',
              token: d.token,
            }),
          );

          if (d.role) localStorage.setItem('sveltia-cms.userRole', d.role);
          if (d.firstname) localStorage.setItem('sveltia-cms.firstname', d.firstname);
          if (d.lastname) localStorage.setItem('sveltia-cms.lastname', d.lastname);
          if (d.orcid) localStorage.setItem('sveltia-cms.orcid', d.orcid);
          if (d.groups) {
            localStorage.setItem('sveltia-cms.userGroups', JSON.stringify(d.groups));
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to persist ORCID auth info', err);
        }

        window.location.reload();
      }
    };

    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
    };
  });
</script>

<div role="none" class="buttons">
  {#if $signingIn}
    <div role="alert" class="message">{$_('signing_in')}</div>
  {:else if configuredBackend}
    {#if showLocalBackendOption}
      <Button
        variant="primary"
        label={$_('work_with_local_repo')}
        disabled={!isLocalBackendSupported}
        onclick={async () => {
          await signInManually('local');
        }}
      />
      {#if !isLocalBackendSupported}
        <div role="alert">
          {#if isBrave}
            {@html makeLink(
              $_('local_backend.disabled'),
              'https://sveltiacms.app/en/docs/workflows/local#enabling-file-system-access-api-in-brave',
            )}
          {:else}
            {$_('local_backend.unsupported_browser')}
          {/if}
        </div>
      {:else if !$signInError.message}
        <div role="none">
          {#if repositoryName}
            {$_('work_with_local_repo_description', { values: { repo: repositoryName } })}
          {:else}
            {$_('work_with_local_repo_description_no_repo')}
          {/if}
        </div>
      {/if}
      <Spacer />
    {/if}
    <Button
      variant={showLocalBackendOption ? 'secondary' : 'primary'}
      label={isTestRepo
        ? $_('work_with_test_repo')
        : $_('sign_in_with_x', { values: { service: configuredBackend.label } })}
      onclick={async () => {
        await signInManually(configuredBackendName);
      }}
    />
    {#if !isTestRepo}
      <Button
        variant="secondary"
        label={$_('sign_in_with_x_using_token', { values: { service: configuredBackend.label } })}
        onclick={() => {
          showTokenDialog = true;
        }}
      />
    {/if}
    <Button variant="secondary" label="Sign in with ORCID" onclick={signInWithOrcid} />
  {/if}
  {#if $signInError.message && $signInError.context === 'authentication'}
    <div role="alert" class="error">
      <Icon name="error" />
      {$signInError.message}
    </div>
  {/if}
</div>

<PromptDialog
  bind:open={showTokenDialog}
  bind:value={token}
  title={$_('sign_in_using_pat_title')}
  textboxAttrs={{ spellcheck: false, 'aria-label': $_('personal_access_token') }}
  okLabel={$_('sign_in')}
  okDisabled={!token.trim()}
  onOk={async () => {
    await signInManually(configuredBackendName, token.trim());
  }}
>
  {$_('sign_in_using_pat_description')}
  {#if configuredBackend?.repository?.tokenPageURL}
    {@html makeLink(
      $_('sign_in_using_pat_link', { values: { service: configuredBackend.label } }),
      configuredBackend.repository.tokenPageURL,
    )}
  {/if}
</PromptDialog>

<style lang="scss">
  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    :global {
      .button {
        width: 320px;
      }
    }
  }

  [role='alert'] {
    display: flex;
    align-items: center;
    gap: 8px;

    &.error {
      color: var(--sui-error-foreground-color);
    }
  }
</style>
