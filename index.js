(() => {
    const { patcher, metro } = vendetta;

    const MessageActions = metro.findByProps("sendMessage");

    if (!MessageActions?.sendMessage) return;

    let targetId = null;

    try {
        targetId = localStorage.getItem("mention_prefix_target");
    } catch {}

    function getMentionIds(message) {
        if (!Array.isArray(message?.mentions)) return [];

        return message.mentions
            .map(user => {
                if (typeof user === "string") return user;
                return user?.id;
            })
            .filter(Boolean)
            .map(String);
    }

    function saveTarget(id) {
        targetId = String(id);

        try {
            localStorage.setItem(
                "mention_prefix_target",
                targetId
            );
        } catch {}
    }

    patcher.before("sendMessage", MessageActions, (args) => {
        const message = args?.[1];

        if (!message?.content) return;

        const content = String(message.content).trim();
        const mentionIds = getMentionIds(message);

        // Tin nhắn chỉ chứa một mention = chọn người đó
        if (
            mentionIds.length === 1 &&
            (
                content === `<@${mentionIds[0]}>` ||
                content === `<@!${mentionIds[0]}>`
            )
        ) {
            saveTarget(mentionIds[0]);
            return;
        }

        if (!targetId) return;

        // Không thêm nếu đã mention target
        if (
            content.startsWith(`<@${targetId}>`) ||
            content.startsWith(`<@!${targetId}>`)
        ) {
            return;
        }

        // Thêm mention target vào đầu
        message.content = `<@${targetId}> ${message.content}`;

        if (!Array.isArray(message.mentions)) {
            message.mentions = [];
        }

        if (!message.mentions.some(
            user => String(user?.id) === String(targetId)
        )) {
            message.mentions.push({
                id: String(targetId)
            });
        }
    });
})();
