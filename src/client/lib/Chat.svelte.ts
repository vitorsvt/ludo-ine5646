import type { Chat } from "../../common/models/message.ts";

export let messages = $state({
    global: [] as Chat[],
    match: [] as Chat[],
});
