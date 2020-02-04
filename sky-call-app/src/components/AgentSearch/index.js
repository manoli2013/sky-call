import React, { useState, useEffect } from 'react'
import Feedback from '../Feedback'
import AgentClientResults from '../AgentClientResults'
import { listClientsRoute } from '../../logic'
import { withRouter } from 'react-router-dom'


function AgentSearch({  }) {

    const { token } = sessionStorage
    const [clients, setClients] = useState([])
    // const [location, setLocation] = useState()
    const [error, setError] = useState()

    useEffect(() => {
        
        (async () => {
            if (token) {
                // const clientsList = await listClientsRoute(token, location)
                // setClients(clientsList)
            }
        })()
    }, [clients, setClients])



    async function handleListClientsRoute(event) {
        event.preventDefault()

        try {
            const {token} = sessionStorage
            const location = event.target.select.value
            const clientsList = await listClientsRoute(token, location)
            setClients(clientsList)
        } catch (error) {
            setError(error.message.toString())
        }
    }

    return <section className="search">

            <div className="search__container">

            <form className = "search__form-bar" onSubmit = {handleListClientsRoute}>
            <h2 className='clients__title'>Clients</h2>
                <h3>Pick up your route</h3>

                <select className="search__route" name="select"
                >Select Route
                    <option value="Asturias">Asturias </option>
                    <option value="Valencia">Valencia</option>
                    <option value="Barcelona">Barcelona</option>
                </select>
                <button className = "search__submit-button"> Search </button>

            </form>

            {error && <Feedback message={error} />}

        </div>

        {clients && <AgentClientResults clients={clients} setClients={setClients}/>}

    </section>
}


export default withRouter(AgentSearch)
