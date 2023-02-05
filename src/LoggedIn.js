import { useProfile, dateToUnix, useNostr, useNostrEvents } from "nostr-react"
import { useState } from "react"
import { getEventHash,  signEvent } from "nostr-tools"

import Follower from './Follower'
import Bundles from './Bundles'

function LoggedIn({ myPubkey, followList, kind3Content }) {
	const { data: userData } = useProfile({pubkey: myPubkey});
	const { publish } = useNostr();

	const [creatingBundle, setCreatingBundle] = useState(false)
	const [selectedProfiles, setSelectedProfiles] = useState([])
	const [bundleName, setBundleName] = useState("")
	const [viewBundles, setViewBundles] = useState(false)

	const handleBundleNameInput = (e) => {
		setBundleName(e.target.value)
	}

	const createBundle = async () => {
		let event = {
		  kind: 777,
		  pubkey: myPubkey,
		  created_at: dateToUnix(),
		  tags: selectedProfiles.map((profile) => {
		  	return ['p', profile]
		  }),
		  content: bundleName,
		}
		console.log(event)
		event.id = getEventHash(event)
		
		const signedEvent = await window.nostr.signEvent(event)

		publish(signedEvent)

		setSelectedProfiles([])
		setBundleName("")
		setCreatingBundle(false)
	}

	return (
		<div className="container">
			<p>Hello, {userData && userData.name ? userData.name : myPubkey.substr(0,8)}</p>

			{!creatingBundle && !viewBundles && 
				<div>
					<p><b>Please select the profiles you wish to bundle and publish.</b></p>
					<p><b>Or, <a href="#" onClick={() => setViewBundles(true)}>click here</a> to view bundles created by your friends.</b></p>

					<div className="profiles">
						{followList.map((follower) => {
							return (
								<Follower
									key={follower}
									pubkey={follower}
									selectedProfiles={selectedProfiles}
									setSelectedProfiles={setSelectedProfiles} />
							)
						})}
					</div>

					{selectedProfiles.length > 0 &&
						<div className="create-bundle" onClick={() => setCreatingBundle(true)}>
							<p><b>Bundle {selectedProfiles.length} profiles!</b></p>
						</div>
					}
				</div>
			}

			{creatingBundle && !viewBundles && 
				<div>
					<p><b>Please confirm the list of followers you wish to bundle and give it a name below</b></p>

					<div className="bundle-name">
						<span><b>Bundle Name</b></span>
						<br />
						<input type="text" value={bundleName} onChange={handleBundleNameInput} />
					</div>

					<div className="profiles">
						{selectedProfiles.map((follower) => {
							return (
								<Follower
									key={follower}
									pubkey={follower}
									selectedProfiles={selectedProfiles}
									setSelectedProfiles={setSelectedProfiles} />
							)
						})}
					</div>
					
					{bundleName.length > 0 && 
						<div className="create-bundle" onClick={createBundle}>
							<p><b>Create Bundle Now!</b></p>
						</div>
					}
				</div>
			}

			{viewBundles && 
				<Bundles
					followList={followList}
					myPubkey={myPubkey}
					setViewBundles={setViewBundles}
					kind3Content={kind3Content} />
			}
		</div>
	)
}

export default LoggedIn