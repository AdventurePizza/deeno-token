transaction(codeAsHexString: String, name: String) {
    prepare(contractOwner: AuthAccount) {
    contractOwner.contracts.add(name: name, code: codeAsHexString.decodeHex())
    }
}