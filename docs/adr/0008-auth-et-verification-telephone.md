# Auth & vérification téléphone

## Décision

**Une seule identité** par personne (voir `CONTEXT.md` : Utilisateur, Rôle). L'authentification est gérée **in-stack avec Spring Security** :

- **Social login** via `spring-boot-starter-oauth2-client` (Google, Apple).
- **Email passwordless** (magic link ou OTP) — pas de mot de passe stocké.
- Le backend **émet ses propres jetons** et se comporte comme un **resource server OIDC** (validation par issuer/JWKS).
- Le domaine d'identité (Utilisateur, rôles, rattachement Partenaire) vit en **Postgres**, indépendant du mécanisme de connexion.

**Vérification du téléphone** (ADR 0003) = **étape de confiance distincte du login**, via **Twilio Verify** (OTP SMS), déclenchée au **1er paiement** et **avant de rejoindre/créer un groupe public** — pas une méthode de connexion.

## Pourquoi

Dev solo, préférence « posséder son stack ». L'auth reste dans **Spring Security** (mature — on ne bricole pas de crypto), **sans lock-in SaaS** et **sans service IAM à opérer**. Le passwordless évite tout le pénible et risqué du mot de passe (stockage, reset, fuites). Twilio Verify couvre l'OTP SMS sans le mêler au login.

## Alternatives rejetées

- **Firebase Auth (IdP SaaS)** : le plus rapide et le moins d'effort, mais lock-in Google et à contre-courant du « tout posséder ». Reste le repli si l'effort in-stack devient un frein.
- **Keycloak dès la V1** : infrastructure prématurée. Son coût réel est l'**ops** (patchs, sauvegardes, dispo, churn de montées de version) — payé pendant des années **avant** d'utiliser la moindre de ses fonctionnalités (SSO, fédération, multi-realm), aucune n'étant présente en V1. Différé.

## Conséquence — la couture

La validation des jetons est conçue **agnostique de l'issuer** (forme resource server OIDC). Adopter Keycloak plus tard = **repointer l'issuer (config)**, pas réécrire l'auth. Comme on est **passwordless + social**, il n'y a **aucun hash de mot de passe à migrer** et les identités Google/Apple (`sub`) sont portables — la migration éventuelle est bon marché.
