import { useEffect, useState } from 'react'
import { NostrProvider} from "nostr-react"
import { relayInit } from "nostr-tools"
import LoggedIn from './LoggedIn'

import './App.css';

const defaultRelayUrls = [
  'wss://no.str.cr',
  'wss://paid.no.str.cr',
  'wss://nostr.fly.dev',
  'wss://nostr.robotechy.com',
  'wss://nostr-relay.untethr.me',
  'wss://nostr-pub.wellorder.net',
  'wss://nostr.bitcoiner.social',
  'wss://nostr.fmt.wiz.biz',
  'wss://nostr-relay.wlvs.space',
  'wss://relay.snort.social',
  'wss://nostr.fly.dev',
  'wss://relay.realsearch.cc',
  'wss://relay.nostrgraph.net',
  'wss://relay.minds.com/nostr/v1/ws',
  'wss://nos.lol',
  'wss://relay.current.fyi',
  'wss://brb.io',
  'wss://puravida.nostr.land',
  'wss://nostr.milou.lol',
]

function App() {

  const [mostRecentKind3, setMostRecentKind3] = useState(0)
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

  useEffect(() => {
    async function getRelayList() {
      defaultRelayUrls.forEach(async (relayUrl) => {
        const relay = relayInit(relayUrl)
        await relay.connect()

        relay.on('connect', () => {
          const sub = relay.sub([
            {
              authors: [pubkey],
              kinds: [3],
            }
          ])
          sub.on('event', event => {
            if(event.created_at > mostRecentKind3) {
              const obj = JSON.parse(event.content)
              const relayUrls = Object.keys(obj)

              setRelayUrls(relayUrls)
              setMostRecentKind3(event.created_at)
            }
          })
          sub.on('eose', () => {
            sub.unsub()
            relay.disconnect()
          })
        })
      })
    }

    if(pubkey) {
      getRelayList()
    }
    
  }, [pubkey])

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
