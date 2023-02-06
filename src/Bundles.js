import { useNostrEvents } from "nostr-react"

import Bundle from './Bundle'

function Bundles({ followList, myPubkey, setViewBundles, kind3Content, defaultBundleId }) {
	const {events: defaultBundle} = useNostrEvents({
	    filter: {
	    	ids: [defaultBundleId],
	    },
	})

	const {events: existingBundles} = useNostrEvents({
	    filter: {
	    	kinds: [7777],
		   	authors: [...followList, myPubkey],
	    },
	})

	return (
		<div>
			<p><b>Check out the bundles your friends have already created!</b></p>
			<p><b>Or, <a href="#" onClick={() => setViewBundles(false)}>click here</a> to go back to create a new bundle</b></p>

			{existingBundles.length > 0 &&
				<div className="profiles">
					{defaultBundleId && defaultBundle.length > 0 &&
						<Bundle
							key={defaultBundle[0].id}
							bundle={defaultBundle[0]}
							followList={followList}
							kind3Content={kind3Content}
							myPubkey={myPubkey}
							defaultBundleId={defaultBundleId} />
					}

					{existingBundles.sort((a, b) => a.created_at - b.created_at).reverse().map((bundle) => {
						return (
							<Bundle
								key={bundle.id}
								bundle={bundle}
								followList={followList}
								kind3Content={kind3Content}
								myPubkey={myPubkey} />
						)
					})}
				</div>
			}

			{existingBundles.length == 0 &&
				<p>No bundles found.</p>
			}

		</div>
	)
}

export default Bundles