<script>
  import { Button } from "@sveltia/ui";
  import DOMPurify from "isomorphic-dompurify";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    signInAutomatically,
    signInError,
    signInManually,
    unauthenticated,
  } from "$lib/services/user/auth";
  import { siteConfig } from "$lib/services/config";
  import { allBackendServices } from "$lib/services/backends";

  let isLocalHost = $state(false);
  let isLocalBackendSupported = $state(false);
  let isBrave = $state(false);
  let isSuperAdmin = $derived($siteConfig?.superadmin ?? false);

  const configuredBackendName = $derived($siteConfig?.backend?.name);
  const configuredBackend = $derived(
    configuredBackendName ? allBackendServices[configuredBackendName] : null
  );
  const repositoryName = $derived($siteConfig?.backend?.repo?.split("/")?.[1]);

  onMount(() => {
    const { hostname } = window.location;

    // Local editing needs a secure context, either `http://localhost` or `http://*.localhost`
    // https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
    isLocalHost =
      hostname === "127.0.0.1" ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost");
    isLocalBackendSupported = "showDirectoryPicker" in window;
    isBrave =
      navigator.userAgentData?.brands.some(({ brand }) => brand === "Brave") ??
      false;

    signInAutomatically();
  });

  // Code to update the user's token when the backend sends it 
  window.addEventListener("message", (event) => {
  if (event.data.backendName === "github" && event.data.token) {
    localStorage.setItem("sveltia-cms.user", JSON.stringify({
      backendName: "github",
      token: event.data.token,
    }));

    console.log("Event:", event.data);
    if (event.data.role) {
      localStorage.setItem("sveltia-cms.userRole", event.data.role);
      localStorage.setItem("sveltia-cms.firstname", event.data.firstname);
      localStorage.setItem("sveltia-cms.lastname", event.data.lastname);
      localStorage.setItem("sveltia-cms.orcid", event.data.orcid);
    }

    if (event.data.groups) {
      localStorage.setItem("sveltia-cms.userGroups", JSON.stringify(event.data.groups));
    }

    window.location.reload();
  }
});

  function signInWithOrcid() {
    const width = 600;
    const height = 800;
    const { availHeight, availWidth } = window.screen;
    const top = availHeight / 2 - height / 2;
    const left = availWidth / 2 - width / 2;

    window.open(
      "https://orcid-sveltia.quentin-glorieux.workers.dev/auth/orcid",
      "orcid-auth",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  }
</script>

<div class="superadmin-banner">
  {#if isSuperAdmin}
    <p class="superadmin-message">👋 Superadmin Login Page</p>
  {/if}
</div>

<div role="none" class="buttons">
  {#if !$unauthenticated}
    <div role="alert" class="message">{$_("signing_in")}</div>
  {:else if !configuredBackend}
    <div role="alert">
      {$_("config.error.unsupported_backend", {
        values: { name: configuredBackendName },
      })}
    </div>
  {:else}
    {#if isSuperAdmin}
      <Button
        variant="primary"
        label={$_("sign_in_with_x", {
          values: { service: configuredBackend.label },
        })}
        onclick={async () => {
          await signInManually(/** @type {string} */ (configuredBackendName));
        }}
      />
    {/if}
    <!-- ORCID Sign-in  QG-->
    <Button
      variant="primary"
      label="Sign in with ORCID"
      onclick={signInWithOrcid}
    />

    {#if isLocalHost}
      <Button
        variant="primary"
        label={$_("work_with_local_repo")}
        disabled={!isLocalBackendSupported}
        onclick={async () => {
          await signInManually("local");
        }}
      />
      {#if !isLocalBackendSupported}
        <div role="alert">
          {#if isBrave}
            {@html DOMPurify.sanitize(
              $_("local_backend.disabled").replace(
                "<a>",
                '<a href="https://github.com/sveltia/sveltia-cms#enabling-local-development-in-brave" target="_blank">'
              ),
              { ALLOWED_TAGS: ["a"], ALLOWED_ATTR: ["href", "target"] }
            )}
          {:else}
            {$_("local_backend.unsupported_browser")}
          {/if}
        </div>
      {:else if !$signInError.message}
        <div role="none">
          {#if repositoryName}
            {$_("work_with_local_repo_description", {
              values: { repo: repositoryName },
            })}
          {:else}
            {$_("work_with_local_repo_description_no_repo")}
          {/if}
        </div>
      {/if}
    {/if}
  {/if}
  {#if $signInError.message && $signInError.canRetry}
    <div role="alert">
      {$signInError.message}
    </div>
  {/if}
</div>

<style lang="scss">
  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    :global(button) {
      width: 240px;
    }
  }
</style>
