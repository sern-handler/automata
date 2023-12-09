import React from "react";
import { useEffect } from "react"

export default function OpenCollectiveDiscordCallback() {
    const [tokenType, setTokenType] = React.useState<string>('')
    useEffect(() => {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
		const accessToken = fragment.get('access_token');
        setTokenType(fragment.get('token_type')!)

        window.location.href = `/ui/oc?dsc-code=${accessToken}`;
    }, [])
    return (
        <p>{tokenType}</p>
    )
}