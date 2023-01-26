import { useEffect, useState } from 'react'
import { NostrProvider} from "nostr-react"
import LoggedIn from './LoggedIn'

import './App.css';

function App() {

  const [relayUrls, setRelayUrls] = useState([])
  const [pubkey, setPubkey] = useState(null)


  useEffect(() => {
    async function testNos2x() {
      if(!window.nostr) {
        alert("You do not have a nostr browser extension installed. :(")
        return
      }

      try {
        const myPubkey = await window.nostr.getPublicKey()

        setPubkey(myPubkey)
      } catch (e) {
        console.log(e)
      }
    }

    setTimeout(testNos2x, 500)
  }, []);

  const selectRelays = () => {
    let relayUrls = prompt("Enter a list of comma separated relay URLs")

    if(relayUrls) {
      relayUrls = relayUrls.split(',')

      if(relayUrls.length > 0) {
        setRelayUrls(relayUrls)
      }
    }
  }

  return (
    <div className="App">

      <h1>Nostr Bulk DM Tool</h1>

      {!pubkey &&
        <p>Please authenticate using your nostr browser extension</p>
      }

      {pubkey && relayUrls.length === 0 &&
        <div>
          <p>Start by selecting relays you want to publish to</p>
          <button onClick={selectRelays}>
            Set Relay List
          </button>
        </div>
      }

      {pubkey && relayUrls.length > 0 && 
        <NostrProvider relayUrls={relayUrls}>
          <LoggedIn 
            myPubkey={pubkey} />
        </NostrProvider>
      }
    </div>
  );
}

export default App;
