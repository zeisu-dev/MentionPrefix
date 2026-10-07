(() => {
    const { patcher, metro } = vendetta;

    const MessageActions = metro.findByProps("sendMessage");

    if (!MessageActions?.sendMessage) return;

    const STORAGE_KEY = "mention_prefix_target";

    let targetId = null;

    // Load saved target
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) targetId = saved;
    } catch {}

    function getMentionIds(message) {
        const mentions = message?.mentions;

        if (!Array.isArray(mentions)) return [];

        return mentions
            .map((user) => {
                if (typeof user === "string") return user;
                return user?.id;
            })
            .filter(Boolean)
            .map(String);
    }

    function saveTarget(id) {
        targetId = String(id);

        try {
            localStorage.setItem(STORAGE_KEY, targetId);
        } catch {}
    }

    patcher.before("sendMessage", MessageActions, (args) => {
        const message = args?.[1];

        if (!message?.content) return;

        const content = String(message.content).trim();
        const mentionIds = getMentionIds(message);

        /*
         * A message containing only one mention:
         * @Nam
         *
         * Save Nam as the new target, but DO NOT modify
         * the message so @Nam is sent normally.
         */
        if (
            mentionIds.length === 1 &&
            /^<@!?\d+>$/.test(content)
        ) {
            saveTarget(mentionIds[0]);
            return;
        }

        // No target selected yet
        if (!targetId) return;

        // Don't prefix a message that already starts with a mention
        if (
            content.startsWith(`<@${targetId}>`) ||
            content.startsWith(`<@!${targetId}>`)
        ) {
            return;
        }

        /*
         * Add the real Discord mention to the message.
         * Keep the mention metadata so Discord can resolve it.
         */
        message.content = `<@${targetId}> ${message.content}`;

        if (!Array.isArray(message.mentions)) {
            message.mentions = [];
        }

        const alreadyMentioned = message.mentions.some(
            (user) => String(user?.id) === String(targetId)
        );

        if (!alreadyMentioned) {
            message.mentions.push({
                id: String(targetId)
            });
        }
    });
})();
