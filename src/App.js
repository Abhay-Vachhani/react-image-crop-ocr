import React, { useEffect, useRef, useState } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { createWorker } from 'tesseract.js'

const App = () => {
    const [image, setImage] = useState()
    const [crop, setCrop] = useState()
    const [croppedImage, setCroppedImage] = useState()
    const imageRef = useRef()

    useEffect(() => {
        setCroppedImage(image)
    }, [image])

    return (
        <>
            <div>
                <input type='file' accept='image/*' onChange={(e) => {
                    const files = e.target.files
                    if (files.length == 0)
                        return
                    setImage(URL.createObjectURL(files[0]))
                }} />
            </div>
            <button style={{ marginTop: 8 }} onClick={async () => {
                if (!croppedImage)
                    return alert('Please select the image to perform OCR')
                const pre = document.getElementById('pre')
                pre.innerText = ''

                const worker = await createWorker('eng', undefined, { logger: m => console.log(`Progress: ${(m.progress * 100).toFixed(2)}% - ${m.status}`) })
                const result = await worker.recognize(croppedImage, {
                    preserve_interword_spaces: '1'
                })
                const text = result.data.text
                await worker.terminate()

                pre.innerText = text
            }}>Crop & OCR</button >
            <div>
                <h3>OCR Result</h3>
                <pre id="pre" style={{ border: '1px solid', minHeight: 200 }} contentEditable></pre>
            </div>
            <div style={{ marginTop: 16 }}>
                <h3>Image Preview</h3>
                <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    onComplete={async crop => {
                        if (!crop.width || !crop.height) {
                            setCroppedImage(image)
                            return
                        }

                        const offscreenCanvas = new OffscreenCanvas(crop.width, crop.height)
                        const offscreenCtx = offscreenCanvas.getContext('2d')
                        offscreenCtx.drawImage(
                            imageRef.current,
                            crop.x,
                            crop.y,
                            crop.width,
                            crop.height,
                            0,
                            0,
                            crop.width,
                            crop.height
                        )

                        setCroppedImage(URL.createObjectURL(await offscreenCanvas.convertToBlob()))
                    }}
                    style={{ minWidth: '40%', border: '1px solid', minHeight: 500 }}
                >
                    <img src={image} ref={imageRef} />
                </ReactCrop>
            </div>
        </>
    )
}

export default App