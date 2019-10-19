class HttpRequest {

    static get(url, params = {}) {
        return HttpRequest.request('GET', url, params);
    }

    static delete(url, params = {}) {
        return HttpRequest.request('DELETE', url, params);
    }

    static put(url, params = {}) {
        return HttpRequest.request('PUT', url, params);
    }

    static post(url, params = {}) {
        return HttpRequest.request('POST', url, params);
    }

    static request(method, url, params = {}) {

        return new Promise((resolve, reject) => {

            let ajax = new XMLHttpRequest();

            ajax.open(method.toUpperCase(), url);
            //ajax usa o metodo recebido pra url informada

            ajax.onerror = event => {

                reject(e);

            }

            ajax.onload = event => {
                //ao termindar de carregar recebe um evento com a resposta do servidor

                let obj = {}
                //declara obj fora do try como vazaio, para previnir erro do foreach 

                try {
                    obj = JSON.parse(ajax.responseText);
                    //sobescreve o valor de obj se houver valor na respota do ajax

                } catch (e) {
                    reject(e);
                    console.error(e)

                }

                resolve(obj);

            }

            ajax.setRequestHeader('Content-type', 'application/json');

            ajax.send(JSON.stringify(params));
            //realiza a solicitação ajax

        });

    }

}