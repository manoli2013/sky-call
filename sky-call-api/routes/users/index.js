const { Router } = require('express')
const { registerUser, authenticateUser, retrieveUser, generalReport, agentsReport, uploadImageUser, loadImageUser} = require('../../logic')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const tokenVerifier = require('../../helpers/token-verifier')(SECRET)
const bodyParser = require('body-parser')
const { errors: { NotFoundError, ConflictError, CredentialsError } } = require('sky-call-util')
const Busboy = require('busboy')

const jsonBodyParser = bodyParser.json()

const router = Router()

router.post('/', jsonBodyParser, (req, res) => {
    const { body: { name, surname, username, password } } = req

    try {
        registerUser(name, surname, username, password)
            .then(() => res.status(201).end())
            .catch(error => {
                const { message } = error

                if (error instanceof ConflictError)
                    return res.status(409).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})


router.post('/auth', jsonBodyParser, (req, res) => {
    const { body: { username, password } } = req

    try {
        authenticateUser(username, password)
            .then(id => {
                const token = jwt.sign({ sub: id }, SECRET, { expiresIn: '1d' })

                res.json({ token })
            })
            .catch(error => {
                const { message } = error

                if (error instanceof CredentialsError)
                    return res.status(401).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.get('/:idUser/data', tokenVerifier, (req, res) => {
    
    try {
        const { id, params: { idUser }  } = req

        // TODO control requester user id permission to see other user (idUser)

        retrieveUser(idUser)
            .then(user => res.json(user))
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch (error) {
        const { message } = error

        res.status(400).json({ message })
    }
})

//Update Agent (desde Admin)

router.patch('/:idUser', tokenVerifier, jsonBodyParser, (req, res) => {
    try {
        const { id, params: { idUser }, body: { name, surname, username, password } } = req

        updateAgent(id, idUser, name, surname, username, password)
            .then(() =>
                res.end()
            )
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
                if (error instanceof ConflictError)
                    return res.status(409).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

//upload image user

router.post('/upload/:idUser', tokenVerifier, (req, res) => {

    const { id , params: { idUser }} = req

    const busboy = new Busboy({ headers: req.headers })

    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
        filename = 'profile'
        await uploadImageUser(id, idUser, file, filename)
       
    })
    busboy.on('finish', () => {
        res.end()
    })
    return req.pipe(busboy)
})

//load image user

router.get('/load/:idUser', tokenVerifier, async (req, res) => {

    const { id , params: { idUser }} = req

   const stream = await loadImageUser(id, idUser)

   res.setHeader('Content-Type', 'image/jpeg')

   return stream.pipe(res)

})

//remove user

// router.delete('/:userId', tokenVerifier, (req, res) => {
//     try {
//         const { id, params: { userId } } = req
        
//         removeUser(id, userId)
//             .then(() =>
//                 res.end()
//             )
//             .catch(error => {
//                 const { message } = error

//                 if (error instanceof NotFoundError)
//                     return res.status(404).json({ message })
//                 if (error instanceof ConflictError)
//                     return res.status(409).json({ message })

//                 res.status(500).json({ message })
//             })
//     } catch ({ message }) {
//         res.status(400).json({ message })
//     }
// })

//AGENTS REPORT ADMIN
router.get('/agents', tokenVerifier, (req, res) => {

    const { id } = req

    try {

        agentsReport(id)
            .then(agents => res.json(agents))
        
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

//GENERAL REPORT (ADMIN)
router.get('/report', tokenVerifier, (req, res) => {debugger

    const { id } = req

    try {

        generalReport(id)
            .then(report => res.json(report))
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})


module.exports = router