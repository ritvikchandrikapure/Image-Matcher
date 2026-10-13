// Tiny IndexedDB wrapper: photos uploaded to the "database" stay saved in the browser.
const open = () =>
  new Promise((res, rej) => {
    const r = indexedDB.open('photomatch', 1)
    r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id', autoIncrement: true })
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })

const run = async (mode, fn) => {
  const db = await open()
  return new Promise((res, rej) => {
    const tx = db.transaction('photos', mode)
    const req = fn(tx.objectStore('photos'))
    tx.oncomplete = () => res(req?.result)
    tx.onerror = () => rej(tx.error)
  })
}

export const getAll = () => run('readonly', (s) => s.getAll())
export const addPhoto = (p) => run('readwrite', (s) => s.add(p)) // returns new id
export const removePhoto = (id) => run('readwrite', (s) => s.delete(id))
export const clearPhotos = () => run('readwrite', (s) => s.clear())
export const renamePhoto = async (id, name) => {
  const all = await getAll()
  const row = all.find((r) => r.id === id)
  if (row) await run('readwrite', (s) => s.put({ ...row, name }))
}
