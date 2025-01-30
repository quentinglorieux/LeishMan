<script>
  import { onMount } from "svelte";
  import AssetsPage from "$lib/components/assets/assets-page.svelte";
  import UploadAssetsConfirmDialog from "$lib/components/assets/shared/upload-assets-confirm-dialog.svelte";
  import UploadAssetsDialog from "$lib/components/assets/shared/upload-assets-dialog.svelte";
  import ConfigPage from "$lib/components/config/config-page.svelte";
  import ContentsPage from "$lib/components/contents/contents-page.svelte";
  import TranslatorApiKeyDialog from "$lib/components/contents/details/editor/translator-api-key-dialog.svelte";
  import EntryParseErrorsToast from "$lib/components/contents/shared/entry-parse-errors-toast.svelte";
  import GlobalToolbar from "$lib/components/global/toolbar/global-toolbar.svelte";
  import SearchPage from "$lib/components/search/search-page.svelte";
  import WorkflowPage from "$lib/components/workflow/workflow-page.svelte";
  import NextcloudPage from "$lib/components/nextcloud/nextcloud-page.svelte";
  import {
    parseLocation,
    selectedPageName,
  } from "$lib/services/app/navigation";
  import { showAssetOverlay } from "$lib/services/assets";
  import { selectedCollection } from "$lib/services/contents/collection";
  import { showContentOverlay } from "$lib/services/contents/draft/editor";

  /**
   * @type {Record<string, any>}
   */
  export const pages = {
    collections: ContentsPage,
    assets: AssetsPage,
    search: SearchPage,
    workflow: WorkflowPage,
    config: ConfigPage,
    nextcloud: NextcloudPage,
  };

  const SelectedPage = $derived(pages[$selectedPageName]);

  /**
   * Select one of the pages given the URL path.
   * @todo Show Not Found page.
   */
  export const selectPage = () => {
    $showContentOverlay = false;
    $showAssetOverlay = false;

    const { path } = parseLocation();
    const { pageName } =
      path.match(`^\\/(?<pageName>${Object.keys(pages).join("|")})\\b`)
        ?.groups ?? {};

    const userRole = localStorage.getItem("sveltia-cms.userRole") || "viewer"; // Default role: viewer
    // ✅ Check if user is accessing an admin-only collection
    if (
      pageName === "collections" &&
      $selectedCollection?.is_admin &&
      userRole !== "admin"
    ) {
      setTimeout(() => {
        window.alert(
          "🚫 You do not have permission to access this collection."
        );
      }, 100);
      window.location.replace("#/collections/members"); // Redirect to a safe location
      return;
    }
    // ❌ Restrict Nextcloud access if not an admin
    if (pageName === "nextcloud" && userRole !== "admin") {
      setTimeout(() => {
        window.alert("🚫 You do not have permission to access Nextcloud.");
      }, 100);
      window.location.replace("#/collections");
      return;
    }

    if (!pageName) {
      window.location.replace(`#/collections/${$selectedCollection?.name}`);
    } else if ($selectedPageName !== pageName) {
      $selectedPageName = pageName;
    }
  };

  onMount(() => {
    selectPage();
  });
</script>

<svelte:window
  onhashchange={() => {
    selectPage();
  }}
/>

<GlobalToolbar />
<SelectedPage />

<UploadAssetsDialog />
<UploadAssetsConfirmDialog />
<TranslatorApiKeyDialog />
<EntryParseErrorsToast />
