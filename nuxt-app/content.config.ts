import { z } from "zod";
import { defineCollection, defineContentConfig } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    collaborations: defineCollection({
      type: "page",
      source: "collaborations/**/*.md",
      schema: z.object({
        title: z.string().optional(),
        institution: z.string().optional(),
        shortdescription: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        lien: z.string().optional(),
        date: z.string().optional(),
      }),
    }),
    documents: defineCollection({
      type: "page",
      source: "documents/**/*.md",
    }),
    events: defineCollection({
      type: "page",
      source: "events/**/*.md",
      schema: z.object({
        title: z.string().optional(),
        date: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        image: z.string().optional(),
        program_pdf: z.string().optional(),
        talk: z.any().optional(),
      }),
    }),
    gallery: defineCollection({
      type: "data",
      source: "gallery.yml",
    }),
    laboratories: defineCollection({
      type: "page",
      source: "laboratories/**/*.md",
      schema: z.object({
        title: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        lat: z.string().optional(),
        lng: z.string().optional(),
        logo: z.string().optional(),
      }),
    }),
    members: defineCollection({
      type: "page",
      source: "members/**/*.md",
      schema: z.object({
        firstname: z.string().optional(),
        lastname: z.string().optional(),
        role: z.string().optional(),
        mail: z.string().optional(),
        thumbnail: z.string().optional(),
        shortbio: z.string().optional(),
        coordinator: z.boolean().optional(),
        laboratory: z.string().optional(),
      }),
    }),
    news: defineCollection({
      type: "page",
      source: "news/**/*.md",
      schema: z.object({
        title: z.string().optional(),
        date: z.string().optional(),
        shortdescription: z.string().optional(),
        longdescription: z.string().optional(),
        image: z.string().optional(),
      }),
    }),
    pages: defineCollection({
      type: "data",
      source: "pages/**/*.yml",
    }),
    projects: defineCollection({
      type: "page",
      source: "projects/**/*.md",
      schema: z.object({
        title: z.string().optional(),
        shortdescription: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        date: z.string().optional(),
        slug: z.string().optional(),
      }),
    }),
    protocols: defineCollection({
      type: "page",
      source: "protocols/**/*.md",
      schema: z.object({
        title: z.string().optional(),
        shortdescription: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        date: z.string().optional(),
      }),
    }),
    publications: defineCollection({
      type: "page",
      source: "publications/**/*.md",
      schema: z.object({
        title: z.string().optional(),
        year: z.string().optional(),
        DOI: z.string().optional(),
        journal: z.string().optional(),
        volume: z.string().optional(),
        authors: z.string().optional(),
        authorslist: z.any().optional(),
      }),
    }),
    users: defineCollection({
      type: "page",
      source: "users/**/*.md",
    }),
  },
});
