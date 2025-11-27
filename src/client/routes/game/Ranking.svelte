<script lang="ts">
    import { onMount } from "svelte";
    import type { User } from "../../../common/models/model.ts";

    let users = $state<User[]>([]);

    onMount(async () => {
        const response = await fetch("/api/users");
        const body = await response.json();
        const unsortedUsers = body.items as User[];
        users = unsortedUsers.sort((a, b) => b.score - a.score);
    });
</script>

<section>
    <h2>Ranking de pontuação</h2>

    <ul>
        {#each users as user}
            <li>{user.username} - {user.score} pontos</li>
        {/each}
    </ul>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        padding: 1rem;
        gap: 1rem;
    }
</style>
