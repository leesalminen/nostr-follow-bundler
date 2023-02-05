import { useState, useEffect } from "react"
import { useProfile } from "nostr-react"
import { nip05 } from 'nostr-tools'


function Follower({ pubkey, selectedProfiles, setSelectedProfiles }) {
	const { data: userData } = useProfile({pubkey});

	const [ isNip05, setIsNip05 ] = useState(false)

	useEffect(() => {
		if(userData && userData.nip05 && !isNip05) {
			nip05.queryProfile(userData.nip05)
			.then((res) => {
				if(res && res.pubkey && res.pubkey === pubkey) {
					setIsNip05(true)
				}
			})
		}
	}, [userData])

	const toggleProfile = () => {
		let profiles = [...selectedProfiles]
		const currentPos = profiles.indexOf(pubkey)
		if(currentPos > -1) {
			profiles.splice(currentPos, 1)
		} else {
			profiles.push(pubkey)
		}
		
		setSelectedProfiles(profiles)
	}

	return (
		<div className="flex-container">
			<div className="profileSelector">
				<input type="checkbox" onChange={toggleProfile} checked={selectedProfiles.indexOf(pubkey) !== -1} />
			</div>
			<div className="profilePicture">
				{userData && userData.picture && userData.picture.length > 0 && 
					<img src={userData.picture} style={{width: 100}} onClick={toggleProfile} />
				}
				{(!userData || !userData.picture || userData.picture.length == 0) &&
					<img src="https://placehold.it/100x100" onClick={toggleProfile} />
				}
			</div>
			<div className="profileDetails" onClick={toggleProfile}>
				<span><b>Username</b> {userData && userData.name ? userData.name : pubkey.substr(0, 8)}</span>
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
	)
}

export default Follower