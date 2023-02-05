import { useState, useEffect } from "react"
import { useProfile, useNostr, dateToUnix } from "nostr-react"
import { nip05, getEventHash, signEvent } from 'nostr-tools'


import Follower from './Follower'

function Bundle({ bundle, followList, kind3Content, myPubkey }) {
	const { publish } = useNostr();
	const { data: userData } = useProfile({pubkey: bundle.pubkey});

	const [ isNip05, setIsNip05 ] = useState(false)
	const [ viewBundle, setViewBundle ] = useState(false)

	const pubkeys = bundle.tags.map(tag => tag[1])

	useEffect(() => {
		if(userData && userData.nip05 && !isNip05) {
			nip05.queryProfile(userData.nip05)
			.then((res) => {
				if(res && res.pubkey && res.pubkey === bundle.pubkey) {
					setIsNip05(true)
				}
			})
		}
	}, [userData])
	
	const addFollowers = async () => {
		const newList = [...new Set([...followList, ...pubkeys])]

		console.log(newList)

		let event = {
		  kind: 3,
		  pubkey: myPubkey,
		  created_at: dateToUnix(),
		  tags: newList.map((profile) => {
		  	return ['p', profile]
		  }),
		  content: JSON.stringify(kind3Content),
		}
		console.log(event)
		event.id = getEventHash(event)
		
		const signedEvent = await window.nostr.signEvent(event)

		publish(signedEvent)

		setTimeout(() => {
			alert("We have added these profiles to your follow list!")
		}, 500)
	}

	return (
		<div>
			<div className="flex-container">
				<div className="profileSelector">
					<button onClick={() => setViewBundle(!viewBundle)}>
						{!viewBundle &&
							<span>View Bundle</span>
						}
						{viewBundle &&
							<span>Hide Bundle</span>
						}
					</button>
				</div>
				
				<div className="profileDetails">
					<span><b>Bundle Name</b> {bundle.content}</span>
					<br />
					<span><b>Created At</b> {new Date(bundle.created_at * 1000).toISOString()}</span>
					<br />
					<span><b># of Profiles</b> {pubkeys.length}</span>
					<br />
					<span><b>Published By</b> {userData && userData.name ? userData.name : bundle.pubkey.substr(0, 8)}</span>
					<br />
					{isNip05 &&
						<span>
							<span><b>NIP-05</b></span> 
							{" "}
							<span style={{color: "green", fontWeight: "bold"}}>
								{userData.nip05}
							</span>
						</span>
					}
				</div>
			</div>
			{viewBundle &&
				<div className="bundle-list">
					<button onClick={addFollowers}>Add Followers</button>
					<br />
					<br />
					{pubkeys.map((pubkey) => {
						return (
							<Follower
								key={pubkey}
								pubkey={pubkey}
								selectedProfiles={followList} />
						)
					})}
				</div>
			}
		</div>
	)
}

export default Bundle