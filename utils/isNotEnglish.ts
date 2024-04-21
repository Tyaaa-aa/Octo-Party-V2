export default function (username: string) {
    const englishRegex = /^[A-Za-z0-9 !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]*$/;
    return !englishRegex.test(username);
};