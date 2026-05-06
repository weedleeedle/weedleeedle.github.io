<script lang="ts">
    let name: string = $state("");
    $inspect(name);
</script>

<input type="text" bind:value={name} />
<p>Hello {name}!</p>
