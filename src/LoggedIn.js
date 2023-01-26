import { useProfile, dateToUnix, useNostr } from "nostr-react"
import { useState } from "react"
import * as Papa from 'papaparse'
import { nip19, getEventHash } from "nostr-tools"

function LoggedIn({ myPubkey }) {
	const { data: userData } = useProfile({pubkey: myPubkey});
	const { publish } = useNostr();

	const [data, setData] = useState([])
	const [sending, setSending] = useState(false)

	const completeFileCallback = async (data) => {
		if(data.errors.length) {
			alert(data.errors.join("\n"))
			return
		}

		const mapData = await Promise.all(data.data.map(async (arr) => {
			let pubkey = arr[0].toLowerCase()
			let message = arr[1]
			let encryptedMessage = ''
			let errors = []

			if(pubkey.indexOf('npub') === 0) {
				let {type, data} = nip19.decode(pubkey)

				if(type === 'npub') {
					pubkey = data
				} else {
					errors.push('invalid pubkey provided')
				}
			} else {
				if(pubkey.length !== 64) {
					errors.push('invalid pubkey length')
				}
			}

			encryptedMessage = await window.nostr.nip04.encrypt(pubkey, message)

			let event = {
			  kind: 4,
			  pubkey: myPubkey,
			  created_at: dateToUnix(),
			  tags: [['p', pubkey]],
			  content: encryptedMessage,
			}
			event.id = getEventHash(event)
			
			const signedEvent = await window.nostr.signEvent(event)

			return {
				pubkey: pubkey,
				message: message,
				encryptedMessage: encryptedMessage,
				errors: errors,
				signedEvent: signedEvent,
			}
		}));

		console.log(mapData)

		setData(mapData)
	}

	const handleFileSelect = (e) => {
		const file = e.target.files[0]

		if(file.type !== 'text/csv') {
			alert('Invalid file type.')
			return
		}

		Papa.parse(
			file, 
			{
				complete: completeFileCallback,
			}
		)
	}

	const publishMessages = () => {
		if(!sending) {
			setSending(true)
			data.forEach((el) => {
				publish(el.signedEvent)
			})
			
			setTimeout(() => {
				setSending(false)
				setData([])
				alert("Your DMs have been sent!")
			}, 1000)
		}
	}

	return (
		<div>
			<p>Hello, {userData && userData.name ? userData.name : myPubkey.substr(0,8)}</p>

			<p><b>Select a CSV file that contains rows of 2 columns (pubkey,message)</b></p>
			<input type="file" onInput={handleFileSelect} />

			{data.length > 0 && 
				<>
					<div>
						<p><b>You have entered {data.length} pubkeys to DM</b></p>
						<table>
							<thead>
								<tr>
									<th><b>Pubkey</b></th>
									<th><b>Message</b></th>
									<th><b>Errors</b></th>
								</tr>
							</thead>
							<tbody>
								{data.map((el) => {
									return (
										<tr key={el.signedEvent.id} style={{color: (el.errors.length > 0 ? "red" : "black")}}>
											<td>{el.pubkey}</td>
											<td>{el.message}</td>
											<td>{el.errors.join(', ')}</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
					<br />
					<p><b>Please review the above, once ready click the button below to send the bulk DMs</b></p>
					<button onClick={publishMessages} disabled={sending}>Send {data.length} DMs Now!</button>
				</>
			}
			
		</div>
	)
}

export default LoggedIn