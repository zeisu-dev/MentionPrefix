import { getModules } from "@revenge-mod/modules/finders"
import { withSingleProp } from "@revenge-mod/modules/finders/filters"

export default plugin({
    start() {
        console.log("[MentionPrefix] scanner started")

        getModules(
            withSingleProp("sendMessage"),
            (module) => {
                console.log("[MentionPrefix] FOUND:", module)
            }
        )
    },

    stop() {
        console.log("[MentionPrefix] scanner stopped")
    },
})