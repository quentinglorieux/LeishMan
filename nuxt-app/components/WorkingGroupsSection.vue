<template>
    <section class="py-12">
        <div>
            <h2 class="font-display text-3xl mb-6">Working Groups</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <NuxtLink v-for="group in groups" :key="group.id" :to="'/projects/' + group.title"
                    class="group relative overflow-hidden rounded-[22px] border border-white/70 bg-white/80 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
                    <div class="aspect-[4/3] overflow-hidden">
                        <img v-if="group.image" :src="group.image" :alt="group.title"
                            class="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                        <div v-else class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                            <span class="text-xs uppercase tracking-widest font-semibold">No Image</span>
                        </div>
                    </div>
                    <div class="p-4 bg-white/50 backdrop-blur-sm">
                        <h3
                            class="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                            {{ group.title }}
                        </h3>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </section>
</template>

<script setup>
const groups = await queryCollection('projects').all();
</script>
