<!--
@component
Prompts the user to select a constraint.
-->

<script lang="ts" module>
    import type { Component } from "svelte";
    import type { DistanceConstraintData } from "./DistanceConstraint.svelte";
    import DistanceConstraint from "./DistanceConstraint.svelte";
    export type ConstraintData = DistanceConstraintData;
</script>

<script lang="ts">
    import { render } from "svelte/server";

    interface ConstraintOption {
        label: string,
        // Idk what type this will end up being
        constraint: any,
        data: ConstraintData
    }

    let options: Map<string, ConstraintOption> = new Map([
        ["distance_constraint", 
        {
            label: "Maximum Separation Constraint",
            constraint: DistanceConstraint,
            data: {
                constraint_type: "max_distance",
                data: {
                    max_distance: 0 
                }
            }
        }]
    ])

    let selected_option: ConstraintOption = $state(options.get("distance_constraint")!)
    let selected_component_data = $derived.by(() => {
        return render(selected_option.constraint, { props: selected_option.data})
    });
</script>

<select name="constraints" id="constraints" bind:value={selected_option}>
    {#each options as option}
    <option value={option[0]}>{option[1].label}</option>
    {/each}
</select>

<svelte:head>{selected_component_data.head}</svelte:head>
<div>
    {selected_component_data.body}
</div>

