const dataHolder = document.getElementById('data');
const stateHolder = document.getElementById('readState').classList;

function tryParseQR(imageData) {
    dataHolder.innerText = 'Analyzing image';
    const data = jsQR(imageData.data, imageData.width, imageData.height);
    if (data) {
        dataHolder.classList.toggle('sysMsg', false);
        dataHolder.innerText = data['data'];
        stateHolder.toggle('stateError', false);
    }
    else {
        dataHolder.innerText = 'No QR code found';
        stateHolder.toggle('stateError', true);
    }
}

function readDataFromFile(file) {
    dataHolder.innerText = 'Reading image';

    var fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = function () {
        const img = new Image();
        img.src = fr.result;

        const canvas = document.getElementById('readImg')

        img.onload = () => {
            canvas.setAttribute("height", img.height);
            canvas.setAttribute("width", img.width);

            dataHolder.innerText = 'Converting image';

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, img.width, img.height);
            setTimeout(() => { tryParseQR(imgData); }, 0);
        }
        img.onerror = (error) => {
            dataHolder.innerText = 'Error reading image';
            stateHolder.toggle('stateError', true);
            console.error(error);
        }
    };
    fr.onerror = function (error) {
        dataHolder.innerText('Error reading file');
        stateHolder.toggle('stateError', true);
        console.error(error);
    }
}

function forceReadFromClipboard() {
    dataHolder.classList.toggle('sysMsg', true);

    navigator.clipboard.read().then((clipData) => {
        console.log(window.clipboardData);
        console.log(clipData);
        if (clipData.length === 0 ||
            clipData[0].types.length !== 1 ||
            !clipData[0].types[0].startsWith('image/')
        ) {
            dataHolder.innerText = 'No readable file found';
            stateHolder.toggle('stateError', true);
            return;
        }
        clipData[0].getType(clipData[0].types[0]).then((blob) => {
            readDataFromFile(blob);
        });
    }).catch((error) => {
        dataHolder.innerText = 'Error reading clipboard';
        stateHolder.toggle('stateError', true);
        console.error(error);
    });
}

document.onpaste = (event) => {
    dataHolder.classList.toggle('sysMsg', true);
    const clipData = event.clipboardData || window.clipboardData;
    if (clipData.files.length === 0) {
        dataHolder.innerText = 'No file found';
        stateHolder.toggle('stateError', true);
        return;
    }

    const file = clipData.files[0];

    readDataFromFile(file);
};