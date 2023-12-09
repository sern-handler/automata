import React from 'react'
import './OpenCollectiveDiscord.css'
import { styled } from '@mui/material';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { useLocation } from 'react-router-dom';

export default function OpenCollectiveDiscord() {
    const { search } = useLocation();
    const query = React.useMemo(() => new URLSearchParams(search), [search]);

    // THIS IS HELD BY ACTUAL DUCT TAPE, SKIP TO LINE 31 FOR ACTUALLY GOOD CODE
    const localStorageOC = window.localStorage.getItem('oc-code');
    const [loadingOCButton, setLoadingOCButton] = React.useState(false);
    const [disabledOCButton] = React.useState(query.has('oc-code') || !!localStorageOC);
    const [loadingDiscordButton, setLoadingDiscordButton] = React.useState(false);
    const [disabledDiscordButton, setDisabledDiscordButton] = React.useState(true);

    if (query.has('oc-code')) window.localStorage.setItem('oc-code', query.get('oc-code')!);
    if (query.has('dsc-code')) window.localStorage.setItem('dsc-code', query.get('dsc-code')!);

    const localStorageDiscord = window.localStorage.getItem('dsc-code');
    React.useEffect(() => {
        // Check conditions and update the state
        if (query.has('oc-code') || localStorageOC) {
          setDisabledDiscordButton(false);
        }
      }, [query, localStorageOC]);

    if (localStorageOC && localStorageDiscord) window.location.href = `oc/complete?oc-code=${localStorageOC}&dsc-code=${localStorageDiscord}`

    const OCLoginButton = styled(LoadingButton)<LoadingButtonProps>(({ theme }) => ({
        color: theme.palette.getContrastText('#7ca9ed'),
        backgroundColor: '#7ca9ed',
        '&:hover': {
            color: theme.palette.getContrastText('#bddafc'),
            backgroundColor: '#bddafc',
        },
    }));
    const DiscordLoginButton = styled(LoadingButton)<LoadingButtonProps>(({ theme }) => ({
        color: theme.palette.getContrastText('#5865F2'),
        backgroundColor: '#5865F2',
        '&:hover': {
            color: theme.palette.getContrastText('#4752c4'),
            backgroundColor: '#4752c4',
        },
    }));
    return (
      <div className="mainStuff">
        <p>Link your OpenCollective account with Discord</p>
        <div className="loginButtons">
          <OCLoginButton
            variant="contained"
            sx={{ marginRight: "20px" }}
            disabled={disabledOCButton}
            loading={loadingOCButton}
            onClick={async () => {
              setLoadingOCButton(true);
              await new Promise(r => setTimeout(r, 1000));
              window.location.href = 'https://opencollective.com/oauth/authorize?client_id=031b505e94b345547b82&response_type=code'
            }}
          >
            <span>Log into OpenCollective</span>
          </OCLoginButton>
          <DiscordLoginButton
            variant="contained"
            disabled={disabledDiscordButton}
            loading={loadingDiscordButton}
            onClick={async () => {
                setLoadingDiscordButton(true)
                await new Promise(r => setTimeout(r, 1000));
                window.location.href = 'https://discord.com/api/oauth2/authorize?client_id=1157990302959800380&redirect_uri=https%3A%2F%2Fautomatadev.srizan.dev%2Fui%2Foc%2Fdiscord%2Fcallback&response_type=token&scope=guilds%20identify'
            }}
          >
            <span>Log into Discord</span>
          </DiscordLoginButton>
        </div>
      </div>
    );
}