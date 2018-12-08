Problem bei Google Browser ist, dass man mit in der Konsole immer

Refused to execute inline script because it violates the following Content Security Policy directive: "default-src 'self'

erhält. Dies liegt an den default Einstellungen der Content Security Policy, was inline-scripte verbietet.

Um das Problem temporär zu lösen gibt es ein Plugin: https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden/related
das hilft um die Policy auszustellen. Langfristige Lösung wäre einen eindeutigen Nonce zu erstellen für den Script Block um diesen zu erlauben.
