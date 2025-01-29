<script>
  import { Dialog, Button, TextInput } from "@sveltia/ui";
  import { fetchPublicationFromDOI } from "$lib/services/utils/doiService";
  import { entryDraft } from "$lib/services/contents/draft";
  import { _ } from "svelte-i18n";

  export let open = false;

  let doi = "";
  let errorMessage = "";
  let fetchedData = null;

  async function handleFetchDOI() {
    if (!doi.trim()) {
      errorMessage = $_("doi_empty");
      return;
    }

    errorMessage = "";

    try {
      const result = await fetchPublicationFromDOI(doi);
      console.log("DOI Fetch Result:", result);

      if (result.error) {
        errorMessage = result.error;
      } else {
        fetchedData = result.data;
        populateForm(fetchedData);
      }
    } catch (err) {
      errorMessage = $_("doi_fetch_error");
    }
  }
  function populateForm(data) {
    if (!data) {
      console.error("populateForm: No data received!");
      return;
    }

    entryDraft.update((draft) => {
      if (!draft) {
        console.error("populateForm: No draft found!");
        return draft;
      }

      draft.isNew = draft.isNew ?? true;
      draft.collectionName = draft.collectionName ?? "publications";

      if (!draft.currentValues) {
        draft.currentValues = {};
      }

      if (!draft.currentValues._default) {
        draft.currentValues._default = {};
      }

      const formattedAuthors = Array.isArray(data.author)
        ? data.author
            .map((a) => {
              const lastName = a.family || "";
              const firstInitial = a.given
                ? a.given.charAt(0).toUpperCase()
                : "";
              return `${lastName} ${firstInitial}`.trim();
            })
            .join(", ")
        : "";

      draft.currentValues._default.title = data.title?.[0] || "Template";
      draft.currentValues._default.authors = formattedAuthors;
      draft.currentValues._default.journal = data["container-title"]?.[0] || "";
      draft.currentValues._default.year = data.issued?.["date-parts"]?.[0]?.[0]
        ? String(data.issued["date-parts"][0][0])
        : "";
      draft.currentValues._default.volume = data.volume || "";
      draft.currentValues._default.DOI = data.DOI || "";
      draft.currentValues._default.pmid = data.pmid || "";

      return draft;
    });

    console.log("populateForm: Form updated successfully!");

    open = false;
  }
</script>

<Dialog
  bind:open
  title={"Fetch Metadata from DOI"}
  showOk={false}
  showCancel={false}
>
  <TextInput bind:value={doi} placeholder="10.1103/PhysRevLett.116.061102" />

  {#if errorMessage}
    <p>{$errorMessage}</p>
  {/if}

  <Button variant="primary" onclick={handleFetchDOI}>Fetch Metadata</Button>
  <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
</Dialog>
