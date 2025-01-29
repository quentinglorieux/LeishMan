<script>
  import { Dialog, Button, TextInput } from "@sveltia/ui";
  import { fetchPublicationFromDOI } from "$lib/services/utils/doiService";
  import { _ } from "svelte-i18n";

  export let open = false;

  let doi = "";
  let publicationData = null;
  let errorMessage = "";

  async function handleFetchDOI() {
    if (!doi.trim()) {
      errorMessage = $_("doi_empty");
      return;
    }

    errorMessage = "";
    publicationData = null;

    try {
      const result = await fetchPublicationFromDOI(doi);

      if (result.error) {
        errorMessage = result.error;
      } else {
        publicationData = result.data;
      }
    } catch (err) {
      errorMessage = $_("doi_fetch_error");
    }
  }

  function handleSave() {
    console.log("Saving publication:", publicationData);
    // Add your save logic here (e.g., API call to store publication data)
  }
</script>

<Dialog
  bind:open
  title={"Import Publication using DOI"}
  showOk={false}
  showCancel={false}
>
  <TextInput bind:value={doi} placeholder="10.1103/PhysRevLett.116.061102" />

  {#if errorMessage}
    <p>{$errorMessage}</p>
  {/if}

  {#if publicationData}
    <p>
      <strong>{"Title"}:</strong>
      {publicationData.title?.[0] || $_("no_title")}
    </p>
    <p>
      <strong>{"Authors"}:</strong>
      {publicationData.author?.[0]?.family + " et al." || $_("no_authors")}
    </p>
    <p>
      <strong>{"Journal"}:</strong>
      {publicationData["container-title"]?.[0] || $_("no_journal")}
    </p>

    <Button variant="primary" onclick={handleSave}>Save the publication</Button>
    <Button variant="secondary" onclick={handleFetchDOI}>
      New search
    </Button>
  {/if}

  {#if !publicationData}
  <Button variant="primary" onclick={handleFetchDOI}>
    Find the publication online
  </Button>
  {/if}


  <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
</Dialog>
