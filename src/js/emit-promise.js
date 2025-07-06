export function emitPromise( emit, name, data ) {
    return new Promise( resolve => {
        data.callback = resolve;
        emit( name, data );
    })
}