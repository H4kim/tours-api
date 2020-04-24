/* eslint-disable */

const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        if (res.data.status == 'success') {
            alert('Welcome back');
            window.setTimeout(() => {
                location.assign('/')
            }, 1500);
        }
    } catch (err) {
        alert(err.response.data.message)
    }

}
const events = ['submit', 'keyup']

events.forEach(el => {
    document.querySelector('.form').addEventListener(el, e => {
        if (el === 'submit' || e.keyCode === 13) {
            e.preventDefault()
            const email = document.getElementById('email').value
            const password = document.getElementById('password').value

            login(email, password)
        }
    })
})