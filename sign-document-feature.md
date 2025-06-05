# Intro

- This document is about a new feature we need to implemnt to the current repository, related to Documents.
- This new feature will allow the admin user to request the signature of employes to the Documents.

# Branch

Create a new branch called "nmella/sign-documents". This new feature will be use to manage documents signatures for employees. 

# Docuseal

- We will use an opensource sign-document solution called "docuseal" which has already been deployed to "https://contratos.jus.cl".
- The docuseal repository is here if you need it: https://github.com/docusealco/docuseal
- The docuseal API documentation is here: https://www.docuseal.com/docs. API documentation here: https://www.docuseal.com/docs/api
- Docuseal has some libraries for managing the API call (javascript, python, ruby, php). For example, we might use the typescript/javascript library: "https://github.com/docusealco/docuseal-js" in this new feature.

The following token should be added to the header in case we use the API REST method => X-Auth-Token: RCRhkaeQtdZ4vFxmxmGS79FpfBf7j3CwTfjJwBk8eAV

# Sign-Document feature

## Sidebar

- So, we should start this new feature by adding a new  "section" called "Documents" in the @apps/app sidebar. Similar to "policies" or "tasks".
- The "home" or landing of the "documents" section should show 3 tabs: "home", "templates" and "submissions". 

## Documents > home

- The "home" or "landing" of the documents section, should have a similar layout as the "policies" section, which has 2 blocks with report status. 
- For now, let's leave empty each block. Later one we will add some reporting.

## Documents > templates

- In the template section, we should fetch and list the availabe templates at "https://contratos.jus.cl". If we use the API, the following curl request would return all available templates:

```
curl --location 'https://contratos.jus.cl/api/templates' \
--header 'Accept: application/json' \
--header 'X-Auth-Token: RCRhkaeQtdZ4vFxmxmGS79FpfBf7j3CwTfjJwBk8eAV'
```

Currently, there is only one template (ID: 1) called "name": "NDA".


## Documents > submissions

By submission, we fetch a list of employees or users that are required to sign a document. We should list all the submissions. For example, using the API method:

```
curl --location 'https://contratos.jus.cl/api/submissions' \
--header 'Accept: application/json' \
--header 'X-Auth-Token: RCRhkaeQtdZ4vFxmxmGS79FpfBf7j3CwTfjJwBk8eAV'
```

The above call, will return a list of users or "submitters" and their document signature status. 
