const axios = require('axios')
const { customAlphabet } = require('nanoid')
const utils = require('../utils/common')

exports.asyncquery = async (req, res, next, queueData, queryQueue) => {
    try {
        if(queryQueue){
            const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)

            let jobId = nanoid();

            // add job to the queue
            let url
            if(queryQueue.name==='bte_query_queue_by_api'){
                jobId = `BA_${jobId}`
            }
            if(queryQueue.name==='bte_query_queue_by_team'){
                jobId = `BT_${jobId}`
            }
            url = `${req.protocol}://${req.header('host')}/v1/check_query_status/${jobId}`

            let job = await queryQueue.add(
                queueData,
                {
                    jobId: jobId,
                    url: url
                });
            res.setHeader('Content-Type', 'application/json');
            // return the job id so the user can check on it later
            res.end(JSON.stringify({id: job.id, url: url}));
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.status(503).end(JSON.stringify({'error': 'Redis service is unavailable'}));
        }
    }
    catch (error) {
        next(error);
    }
}

exports.asyncqueryResponse = async (handler, callback_url) => {
    let response = null
    let callback_response = null;
    try{
        await handler.query_2();
        response = handler.getResponse();
    }catch (e){
        console.error(e)
        return {
            response: {
                error: e?.name,
                message: e?.message
            },
            status: e?.statusCode,
            callback: ''
        }
    }
    if(callback_url){
        if(!utils.stringIsAValidUrl(callback_url)){
            return {
                response: response,
                status: 200,
                callback: 'The callback url must be a valid url'
            }
        }
        try{
            callback_response = await axios.post(callback_url, JSON.stringify(response), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            //console.log(res)
        }catch (e){
            return {
                response: response,
                status: e.response?.status,
                callback: `Request failed, received code ${e.response?.status}`
            }
        }
    }else{
        return {
            response: response,
            status: 200,
            callback: 'Callback url was not provided'
        };
    }
    return {
        response: response,
        status: callback_response?.status,
        callback: 'Data sent to callback_url'
    };
}