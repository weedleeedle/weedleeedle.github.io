<script lang="ts" module>
    export interface DistanceConstraintData {
        constraint_type: "max_distance";
        data: {
            max_distance: number;
        };
    };
</script>

<script lang="ts">
    let { data = {
        constraint_type: "max_distance",
        data: {
            max_distance: 0
        }
    }
    }: { 
        data: DistanceConstraintData
    } = $props();
</script>

<label for="max_distance">Maximum Separation</label>
<input type="number" id="max_distance" name="max_distance" bind:value={data} min="0" />
