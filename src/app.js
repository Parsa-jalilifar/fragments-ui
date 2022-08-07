// src/app.js

import { Auth, getUser } from './auth';
import {
  getUserFragments,
  postUserFragment,
  deleteUserFragment,
  updateUserFragmentData,
  getFragmentData,
} from './api';

async function init() {
  // Get our UI elements
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  const userSection = document.querySelector('#user');

  const fragmentSection = document.getElementById('fragment-section');
  const fragmentsTypes = document.getElementById('fragments-types');
  const imgUploaderSection = document.getElementById('img-section-uploader');
  const fragmentImageData = document.getElementById('fragment-img-data');
  const txtUploaderSection = document.getElementById('txt-section-uploader');
  const fragmentTextData = document.getElementById('fragment-txt-data');
  const addFragmentBtn = document.getElementById('add-fragment');
  const fragmentEdithSection = document.getElementById('fragment-edith-section');
  const fragmentViewSection = document.getElementById('fragment-view-section');
  const txtEdithUploaderSection = document.getElementById('txt-section-edith-uploader');
  const imgEdithUploaderSection = document.getElementById('img-section-edith-uploader');
  const fragmentImageEdithData = document.getElementById('fragment-img-edith-data');
  const fragmentTextEdithData = document.getElementById('fragment-txt-edith-data');
  const updateFragmentBtn = document.getElementById('update-fragment');
  const tableBody = document.getElementById('tableBody');
  const findFragmentData = document.getElementById('find-fragment-data');
  const findFragmentDataId = document.getElementById('find-data-id');
  const findFragmentDataExt = document.getElementById('find-data-ext');
  const dataRequestSection = document.getElementById('data-request-section');
  const imgDisplay = document.getElementById('image-display');
  const noImgDisplay = document.getElementById('noImage-display');
  const edithIds = document.querySelectorAll('.edithId');

  // image input for upload
  var inputImageUpload;

  // for edith request
  var selectedFragmentId;
  var selectedFragmentType;
  var inputImageEdith;

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    fragmentSection.hidden = true;
    fragmentViewSection.hidden = true;
    fragmentEdithSection.hidden = true;
    imgDisplay.hidden = true;
    noImgDisplay.hidden = true;
    dataRequestSection.hidden = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // display image or text input felid according fragment type selection
  fragmentsTypes.onchange = () => {
    if (['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(fragmentsTypes.value)) {
      imgUploaderSection.hidden = false;
      txtUploaderSection.hidden = true;
    } else {
      imgUploaderSection.hidden = true;
      txtUploaderSection.hidden = false;
    }
  };

  fragmentImageData.onchange = () => {
    inputImageUpload = fragmentImageData.files[0];
  };

  fragmentImageEdithData.onchange = () => {
    inputImageEdith = fragmentImageEdithData.files[0];
  };

  addFragmentBtn.onclick = async () => {
    let postData = fragmentTextData.value || inputImageUpload;
    await postUserFragment(user, fragmentsTypes.value, postData);
    location.reload();
  };

  findFragmentData.onclick = async () => {
    let ext = findFragmentDataExt.value || '';
    let { contentType, data } = await getFragmentData(user, findFragmentDataId.value, ext);

    noImgDisplay.innerHTML = '';
    imgDisplay.hidden = true;

    if (contentType.startsWith('image/')) {
      imgDisplay.src = URL.createObjectURL(data);
      imgDisplay.hidden = false;
    } else {
      data = contentType.startsWith('application/json') ? JSON.stringify(data) : data;
      let txt = document.createTextNode(data);
      noImgDisplay.appendChild(txt);
      noImgDisplay.hidden = false;
    }
  };

  updateFragmentBtn.onclick = async () => {
    let edithData = fragmentTextEdithData.value || inputImageEdith;
    await updateUserFragmentData(user, selectedFragmentId, selectedFragmentType, edithData);
    location.reload();
  };

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Do an authenticated request to the fragments API server and log the result
  const fragments = await getUserFragments(user, 1);

  if (fragments.length > 0) {
    fragmentViewSection.hidden = false;

    fragments.forEach((fragment) => {
      const tr = document.createElement('tr');

      let deleteBtn = document.createElement('button');
      let deleteBtnTxt = document.createTextNode('DELETE');
      let edithBtn = document.createElement('button');
      let edithBtnTxt = document.createTextNode('Edith');
      let buttonsCell = document.createElement('td');

      buttonsCell.classList.add('buttonsCell');

      deleteBtn.onclick = async () => {
        await deleteUserFragment(user, fragment['id']);
        location.reload();
      };

      edithBtn.onclick = async () => {
        selectedFragmentId = fragment.id;
        selectedFragmentType = fragment.type;

        edithIds.forEach((edithId) => (edithId.innerHTML = ''));

        edithIds.forEach((edithId) =>
          edithId.appendChild(document.createTextNode(selectedFragmentId))
        );

        fragmentEdithSection.hidden = false;

        if (fragment.type.split('/')[0] == 'image') {
          imgEdithUploaderSection.hidden = false;
          txtEdithUploaderSection.hidden = true;
        } else {
          imgEdithUploaderSection.hidden = true;
          txtEdithUploaderSection.hidden = false;
        }
      };

      deleteBtn.appendChild(deleteBtnTxt);
      edithBtn.appendChild(edithBtnTxt);
      buttonsCell.appendChild(deleteBtn);
      buttonsCell.appendChild(edithBtn);
      tr.appendChild(buttonsCell);

      ['ownerId', 'id', 'type', 'created', 'updated', 'size'].forEach((element) => {
        const text = document.createTextNode(fragment[element]);
        const td = document.createElement('td');

        td.classList.add(element);

        td.appendChild(text);
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  } else {
    fragmentViewSection.hidden = true;
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
