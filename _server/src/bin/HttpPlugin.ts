const setHttpPlugin = {
    async requestDidStart() {
        return {
            async willSendResponse({ response }: any) {
                if (response.body.kind === 'single' &&
                    response.body.singleResult.errors !== undefined) {
                    response.http.status = response.body.singleResult.errors[0].extensions.status;
                }
            },
        };
    },
};
export default setHttpPlugin