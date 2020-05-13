/* eslint-disable */
import '@babel/polyfill'
import {login ,logout} from './login'
import {displayMap} from './mapBox'
import {updateSettings} from './updateSettings'
import { bookTour } from './stripe'


//DOM ELEMENTS :
const mapEl = document.getElementById('map')
const formEl = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout ');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour')


if(userDataForm) {
    userDataForm.addEventListener('submit' , e => {
    e.preventDefault();
    const form = new FormData()  
    form.append('email', document.getElementById('email').value)
    form.append('name', document.getElementById('name').value)
    form.append('photo', document.getElementById('photo').files[0])
    console.log(form)
    updateSettings(form, 'data')
    })
}

if(userPasswordForm) {
    userPasswordForm.addEventListener('submit' ,async e => {
    e.preventDefault();
    document.querySelector('.btn-save-password').textContent = 'UPDATING ..' 
    const currentPassword = document.getElementById('password-current').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value

    await updateSettings({currentPassword,password,passwordConfirm} , 'password')
    document.querySelector('.btn-save-password').textContent = 'Save password' 

    document.getElementById('password-current').value = ''
    document.getElementById('password').value = ''
    document.getElementById('password-confirm').value = ''

    })
}


if(logoutBtn) {
    logoutBtn.addEventListener('click' , logout)
}

if(formEl) {
    const events = ['submit', 'keyup']
    events.forEach(el => {
        formEl.addEventListener("submit", e => {
            if (el === 'submit' || e.keyCode === 13) {
                e.preventDefault()
                const email = document.getElementById('email').value
                const password = document.getElementById('password').value
                
                login(email, password)
            }
        })
    })
}

if(mapEl) {
    const locations = JSON.parse(mapEl.dataset.locations)
    displayMap(locations)
}

if(bookBtn) {
   bookBtn.addEventListener('click', e => {
       e.target.textContent = 'processing ...'
       const tourId = e.target.dataset.tourId;
       bookTour(tourId)
   })
}