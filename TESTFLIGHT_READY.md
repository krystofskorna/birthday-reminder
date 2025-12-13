# 🚀 FINÁLNÍ CHECKLIST - TestFlight Deploy

## ✅ Všechno je připraveno!

### 📱 **Aplikace je kompletní:**
- ✅ Onboarding tutorial (5 kroků)
- ✅ Premium button v Settings
- ✅ Checklisty propojené všude
- ✅ AdMob reklamy nastaveny
- ✅ In-App Purchases připraveny (3 plány)
- ✅ iCloud Sync
- ✅ Témata & Jazyky
- ✅ Notifikace

---

## 🎯 Kroky k TestFlight (v pořadí):

### **1. Vytvoř aplikaci v App Store Connect** ⏱️ 5 minut

1. Jdi na https://appstoreconnect.apple.com
2. **My Apps** → **+** → **New App**
3. Vyplň:
   - **Name**: Birthday Reminder
   - **Primary Language**: Czech
   - **Bundle ID**: `com.skornakrystof.birthdayreminder`
   - **SKU**: `birthday-reminder-001`
   - **User Access**: Full Access

4. Klikni **Create**

---

### **2. Nastav In-App Purchases** ⏱️ 15 minut

V App Store Connect → tvoje aplikace → **Features** → **In-App Purchases**

#### **A) Vytvoř Subscription Group**
1. Klikni **Manage** u Subscriptions
2. **Create Subscription Group**
3. **Name**: Premium Features
4. Klikni **Create**

#### **B) Týdenní předplatné**
1. **+** → **Auto-Renewable Subscription**
2. **Reference Name**: Premium Weekly
3. **Product ID**: `com.skornakrystof.birthdayreminder.premium.weekly`
4. **Subscription Group**: Premium Features
5. **Subscription Duration**: 1 Week
6. **Price**: Tier 1 ($0.99)
7. **Localization** (Czech):
   - **Display Name**: Premium Týdenní
   - **Description**: Odemkněte všechny funkce bez reklam

#### **C) Roční předplatné**
1. **+** → **Auto-Renewable Subscription**
2. **Reference Name**: Premium Yearly
3. **Product ID**: `com.skornakrystof.birthdayreminder.premium.yearly`
4. **Subscription Group**: Premium Features
5. **Subscription Duration**: 1 Year
6. **Price**: Tier 15 ($14.99)
7. **Localization** (Czech):
   - **Display Name**: Premium Roční
   - **Description**: Ušetřete 75% - Všechny funkce navždy

#### **D) Lifetime**
1. **+** → **Non-Consumable**
2. **Reference Name**: Premium Lifetime
3. **Product ID**: `com.skornakrystof.birthdayreminder.premium.lifetime`
4. **Price**: Tier 40 ($39.99)
5. **Localization** (Czech):
   - **Display Name**: Premium Doživotní
   - **Description**: Zaplaťte jednou, vlastněte navždy

📝 **Důležité**: Pro každý produkt musíš přidat **Screenshot** (můžeš použít stejný 800x800 obrázek pro všechny)

---

### **3. Build aplikaci s EAS** ⏱️ 20-30 minut

#### **A) Nainstaluj EAS CLI**
```bash
npm install -g eas-cli
```

#### **B) Login**
```bash
eas login
```
(Použij svůj Expo účet nebo vytvoř nový)

#### **C) Inicializuj EAS**
```bash
eas build:configure
```

To vytvoří `eas.json`. Updatuj ho:

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "skorna.krystof@gmail.com",
        "ascAppId": "TVOJE_APP_ID",
        "appleTeamId": "TVOJE_TEAM_ID"
      }
    }
  }
}
```

📝 **Poznámka**: `ascAppId` a `appleTeamId` najdeš v App Store Connect

#### **D) Spusť build**
```bash
eas build --platform ios --profile production
```

✅ **Co se stane:**
1. EAS zkomprimuje tvůj projekt
2. Nahraje na Expo servery
3. Buildne iOS app (15-30 min)
4. Dostaneš link na `.ipa` soubor

⏱️ **Čekej 15-30 minut**

---

### **4. Submit na TestFlight** ⏱️ 5 minut

Po dokončení buildu:

```bash
eas submit --platform ios
```

Nebo manuálně:
1. Stáhni `.ipa` z EAS
2. Nahraj přes **Transporter** app
3. Počkaj na processing (10-20 min)

---

### **5. Nastav TestFlight** ⏱️ 5 minut

V App Store Connect → **TestFlight** → **iOS Builds**

1. Vyber svůj build
2. **Test Information**:
   - **What to Test**:
   ```
   Verze 1.0.0 - První TestFlight build
   
   Testujte prosím:
   - ✅ Onboarding tutorial při prvním spuštění
   - ✅ Přidání narozenin a svátků
   - ✅ Import z kontaktů
   - ✅ Notifikace a připomenutí
   - ✅ Checklisty pro oslavy
   - ✅ Premium upgrade (zkuste všechny 3 plány)
   - ✅ Synchronizaci s iCloud
   - ✅ Změny jazyka a tématu
   
   Reklamy se zobrazí pouze neplatícím uživatelům.
   
   Děkujeme za testování! 🎉
   ```

3. **Export Compliance**: 
   - Používá šifrování? → **No** (nebo **Yes** pokud máš HTTPS)

4. Klikni **Submit for Review**

---

### **6. Přidej testery** ⏱️ 2 minuty

1. **TestFlight** → **Internal Testing** → **Default Group**
2. Klikni **+** u **Testers**
3. Přidej emaily:
   - skorna.krystof@gmail.com
   - (další testeři...)
4. Klikni **Add**

✅ Testeři dostanou email s odkazem na TestFlight app!

---

## 📱 Co testeři uvidí:

1. **Email od Apple** s odkazem
2. Stáhnou **TestFlight** app (z App Store)
3. Otevřou link → nainstalují **Birthday Reminder**
4. První spuštění → **Onboarding tutorial** (5 kroků)
5. Můžou testovat všechny funkce!

---

## 🎯 Co testovat:

### **Základní funkce:**
- [ ] Onboarding se zobrazí správně
- [ ] Můžu přidat narozeniny
- [ ] Můžu přidat svátek
- [ ] Import z kontaktů funguje
- [ ] Notifikace přijdou včas
- [ ] Checklist funguje u každé oslavy

### **Premium:**
- [ ] Premium button v Settings funguje
- [ ] Můžu si koupit týdenní předplatné
- [ ] Můžu si koupit roční předplatné
- [ ] Můžu si koupit lifetime
- [ ] Po nákupu zmizí reklamy
- [ ] Premium funkce se odemknou

### **UI/UX:**
- [ ] Témata se mění správně
- [ ] Jazyk se mění správně (CS/EN)
- [ ] Všechno vypadá hezky
- [ ] Žádné crashe

---

## 🐛 Troubleshooting:

### **Build selhává:**
```bash
# Vyčisti cache
rm -rf node_modules
npm install

# Zkus znovu
eas build --platform ios --profile production --clear-cache
```

### **In-App Purchases nefungují:**
1. Zkontroluj Product IDs (musí přesně odpovídat)
2. Produkty musí být "Ready to Submit" v App Store Connect
3. Počkaj 2-3 hodiny na propagaci
4. Sandbox testování vyžaduje sandbox Apple ID

### **Reklamy se nezobrazují:**
1. V development módu = test ads
2. V TestFlight = real ads (ale musíš počkat na AdMob approval 24-48h)
3. Premium uživatelé = žádné reklamy

---

## ✅ Final Checklist:

Před submitem zkontroluj:

- [x] `app.json` - správný bundleIdentifier
- [x] `app.json` - AdMob iOS App ID
- [x] AdBanner - tvoje Banner Ad Unit ID
- [x] services/purchases.ts - Product IDs odpovídají App Store Connect
- [x] Všechny features fungují lokálně
- [x] Žádné console errors
- [x] Onboarding se zobrazí při prvním spuštění
- [x] Premium button v Settings pro neplatící

---

## 🎉 Hotovo!

Po dokončení těchto kroků:
1. ✅ Aplikace je na TestFlight
2. ✅ Testeři můžou stahovat a testovat
3. ✅ Můžeš sbírat feedback
4. ✅ Opravit bugy (pokud nějaké jsou)
5. ✅ Připravit se na App Store Review

---

## 📞 Další kroky:

### **Získej feedback:**
- Pošli link testerům
- Sleduj crashe v TestFlight
- Čti recenze v TestFlight

### **Připrav se na App Store:**
1. Vytvoř screenshoty (min. 3)
2. Napiš description
3. Přidej keywords
4. Vyplň Privacy Policy (pokud potřeba)
5. Submit for Review

---

**Hodně štěstí! 🚀**

Pokud něco není jasné nebo potřebuješ pomoc, napiš!

