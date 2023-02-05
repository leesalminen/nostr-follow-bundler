import { useEffect, useState } from 'react'
import { NostrProvider} from "nostr-react"
import { relayInit } from "nostr-tools"
import LoggedIn from './LoggedIn'

import './App.css';

const defaultRelayUrls = [
  'wss://no.str.cr',
  'wss://paid.no.str.cr',
  'wss://nostr.fly.dev',
  'wss://relay.snort.social',
  'wss://relay.realsearch.cc',
  'wss://relay.nostrgraph.net',
  'wss://relay.minds.com/nostr/v1/ws',
  'wss://nos.lol',
  'wss://relay.current.fyi',
  'wss://puravida.nostr.land',
  'wss://nostr.milou.lol',
  'wss://eden.nostr.land',
  'wss://relay.damus.io',
  'wss://nostr.orangepill.dev',
  'wss://nostr.oxtr.dev',
]

function App() {

  const [mostRecentKind3, setMostRecentKind3] = useState(0)
  const [relayUrls, setRelayUrls] = useState([])
  const [followList, setFollowList] = useState([])
  const [kind3Content, setKind3Content] = useState({})
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
              setMostRecentKind3(event.created_at)

              const relayList = JSON.parse(event.content)
              const relayUrls = Object.keys(relayList)

              if(relayUrls.length > 0) {
                setRelayUrls(relayUrls)
              }
              
              const followList = []
              event.tags.forEach((tag) => {
                if(tag[0] == 'p') {
                  followList.push(tag[1])
                }
              })

              if(followList.length > 0) {
                setFollowList([...new Set(followList)])
              }

              if(event.content.length > 0) {
                const contentObj = JSON.parse(event.content)

                if(contentObj) {
                  setKind3Content(contentObj)
                }
              }
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

      <h1>Nostr Follow Bundler</h1>

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

      {pubkey && relayUrls.length > 0 && followList.length > 0 &&
        <NostrProvider relayUrls={relayUrls}>
          <LoggedIn 
            myPubkey={pubkey}
            followList={followList}
            kind3Content={kind3Content} />
        </NostrProvider>
      }
    </div>
  );
}

export default App;
