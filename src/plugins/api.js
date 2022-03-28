import Vue from 'vue'

// ----------------------------------------------------- MAIN API CLASS

class APIS {

    constructor() {
        this.credentials = null
    }

    // ----------------- INSTALLER

    install() {
        const apis = this
        Vue.mixin({
            beforeCreate() {
                this.$api = apis
            },
        })
    }


    // ----------------- UTILS

    __get_cookie(key) {
        return Object.fromEntries(document.cookie.split('; ').map(cd => cd.split('=')))[key]
    }

    // ----------------- INNER API CALLERS
    
    
    
    
    async __admin_voters_api(endpoint, method, data, headers, data_format = 'json') {
        headers = headers ?? {}
        const options = { method, headers }
        if (data) {
            headers['Content-type'] = {
                'json': 'application/json',
                'text': 'text/plain'
            }[data_format] ?? data_format
            options.body = data_format == 'json' ? JSON.stringify(data) : data
        }
        const url = ["https://mjs.hugocastaneda.fr/api/poll", endpoint].join('/')
        const resp = await fetch(url, options)
        if (!resp.ok) throw new Error(`response error ${resp.status} calling ${url} "${resp.statusText}"`)
        if (resp.headers.get('content-type').includes('application/json')) return await resp.json()
        return await resp.text()
    }
    async __polls_admin_api(endpoint, method, data, headers, data_format = 'json') {
        headers = headers ?? {}
        const options = { method, headers }
        if (data) {
            headers['Content-type'] = {
                'json': 'application/json',
                'text': 'text/plain'
            }[data_format] ?? data_format
            options.body = data_format == 'json' ? JSON.stringify(data) : data
        }
        const url = ["https://mjs.hugocastaneda.fr/api/poll", endpoint].join('/')
        const resp = await fetch(url, options)
        if (!resp.ok) throw new Error(`response error ${resp.status} calling ${url} "${resp.statusText}"`)
        if (resp.headers.get('content-type').includes('application/json')) return await resp.json()
        return await resp.text()
    }
    async __polls_api(endpoint, method, data, headers, data_format = 'json') {
        headers = headers ?? {}
        const options = { method, headers }
        if (data) {
            headers['Content-type'] = {
                'json': 'application/json',
                'text': 'text/plain'
            }[data_format] ?? data_format
            options.body = data_format == 'json' ? JSON.stringify(data) : data
        }
        const url = ["https://mjs.hugocastaneda.fr/api/poll", endpoint].join('/')
        const resp = await fetch(url, options)
        if (!resp.ok) throw new Error(`response error ${resp.status} calling ${url} "${resp.statusText}"`)
        if (resp.headers.get('content-type').includes('application/json')) return await resp.json()
        return await resp.text()
    }
    // ----------------- EXTERNAL CALLERS
    
    polls = {
        is_voter: (token, id) => {
            const headers = { "Authorization": token }
            return this.__polls_api(id + "/voter", "GET", null, headers, null)
        },
        vote: (token, id, data = null) => {
            const headers = { "Authorization": token }
            return this.__polls_api(id + "/vote", "POST", data, headers, "json")
        },
        get: (id) => {
            const headers = null
            return this.__polls_api(id, "GET", null, headers, null)
        },
        results: (id) => {
            const headers = null
            return this.__polls_api(id + "/results", "GET", null, headers, null)
        },
        
        admin: {
            create: (data = null) => {
                const headers = { "Authorization": localStorage.getItem("auth_token") }
                return this.__polls_admin_api("create", "POST", data, headers, "json")
            },
            list: () => {
                const headers = { "Authorization": localStorage.getItem("auth_token") }
                return this.__polls_admin_api("list", "GET", null, headers, null)
            },
            start: (id) => {
                const headers = { "Authorization": localStorage.getItem("auth_token") }
                return this.__polls_admin_api(id + "/start", "PUT", null, headers, null)
            },
            close: (id) => {
                const headers = { "Authorization": localStorage.getItem("auth_token") }
                return this.__polls_admin_api(id + "/close", "PUT", null, headers, null)
            },
            delete: (id) => {
                const headers = { "Authorization": localStorage.getItem("auth_token") }
                return this.__polls_admin_api(id, "DELETE", null, headers, null)
            },
            
            voters: {
                add: (id, data = null) => {
                    const headers = { "Authorization": localStorage.getItem("auth_token") }
                    return this.__admin_voters_api(id + "/voter", "POST", data, headers, "json")
                },
                delete: (id, data = null) => {
                    const headers = { "Authorization": localStorage.getItem("auth_token") }
                    return this.__admin_voters_api(id + "/voter", "DELETE", data, headers, "json")
                },
                
            },
        },
    }
}

// ----------------------------------------------------- VUE INSTALL

const apis = new APIS()
Vue.use(apis)