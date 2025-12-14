# 📱 TestFlight Checklist - Birthday Reminder

## ✅ Co je hotovo:

### 1. **Základní funkce**
- ✅ Přidávání/upravování/mazání oslavy
- ✅ Narozeniny, svátky, vlastní události
- ✅ Import z kontaktů
- ✅ Automatické návrhy svátků
- ✅ Připomenutí (notifikace)
- ✅ Checklisty pro každou oslavu
- ✅ Hlavní panel s přehledem

### 2. **Premium funkce**
- ✅ 3 plány: Týdenní ($0.99), Roční ($14.99), Lifetime ($39.99)
- ✅ iCloud Sync
- ✅ Extra témata
- ✅ Žádné reklamy
- ✅ Quick actions (call/SMS)
- ✅ Advanced reminders
- ✅ Premium onboarding modal
- ✅ Premium tlačítko v Settings pro neplatící

### 3. **UI/UX**
- ✅ Onboarding tutorial (5 kroků)
- ✅ 6 témat (Blue, Purple, Pink, Green, Orange, Red)
- ✅ Dark mode support
- ✅ Čeština a angličtina
- ✅ Krásné animace a gradienty
- ✅ Responsive design

### 4. **Data & Sync**
- ✅ AsyncStorage (lokální)
- ✅ iCloud Sync (Premium)
- ✅ Export/Import dat
- ✅ Backup funkcionalita

---

## 🚀 Kroky pro TestFlight:

### **Krok 1: Zkontroluj app.json**
```json
{
  "expo": {
    "name": "Birthday Reminder",
    "slug": "birthday-reminder",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.skornakrystof.birthdayreminder",
      "supportsTablet": true
    }
  }
}
```

✅ **Status**: Hotovo

---

### **Krok 2: Vytvoř App Store Connect záznam**

1. Jdi na [App Store Connect](https://appstoreconnect.apple.com)
2. **My Apps** → **+** → **New App**
3. Vyplň:
   - **Name**: Birthday Reminder
   - **Primary Language**: Czech nebo English
   - **Bundle ID**: `com.skornakrystof.birthdayreminder`
   - **SKU**: `birthday-reminder-001`
   - **User Access**: Full Access

📝 **Poznámka**: Uložte název aplikace (potřebujete to pro build)

---

### **Krok 3: Nastav In-App Purchases v App Store Connect**

1. V App Store Connect → tvoje aplikace → **Features** → **In-App Purchases**
2. Vytvoř 3 produkty:

#### **Týdenní předplatné**:
- **Type**: Auto-Renewable Subscription
- **Reference Name**: Premium Weekly
- **Product ID**: `com.skornakrystof.birthdayreminder.premium.weekly`
- **Subscription Duration**: 1 Week
- **Price**: $0.99 (Tier 1)
- **Subscription Group**: Premium Features

#### **Roční předplatné**:
- **Type**: Auto-Renewable Subscription
- **Reference Name**: Premium Yearly
- **Product ID**: `com.skornakrystof.birthdayreminder.premium.yearly`
- **Subscription Duration**: 1 Year
- **Price**: $14.99 (Tier 15)
- **Subscription Group**: Premium Features

#### **Lifetime**:
- **Type**: Non-Consumable
- **Reference Name**: Premium Lifetime
- **Product ID**: `com.skornakrystof.birthdayreminder.premium.lifetime`
- **Price**: $39.99 (Tier 40)

📝 **Poznámka**: Musíte vyplnit metadata (název, popis) pro každý produkt

---

### **Krok 4: Build pomocí EAS**

#### **A) Nainstaluj EAS CLI (pokud ještě nemáš)**
```bash
npm install -g eas-cli
eas login
```

#### **B) Inicializuj EAS projekt**
```bash
eas build:configure
```

To vytvoří `eas.json` soubor.

#### **C) Updatuj eas.json**
```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "tvuj@email.com",
        "ascAppId": "TVOJE_APP_ID",
        "appleTeamId": "TVOJE_TEAM_ID"
      }
    }
  }
}
```

#### **D) Spusť build pro TestFlight**
```bash
eas build --platform ios --profile production
```

⏱️ **Čas**: 15-30 minut

---

### **Krok 5: Submit na TestFlight**

#### **A) Automatický submit**
```bash
eas submit --platform ios
```

#### **B) Nebo manuální**
1. Stáhni `.ipa` soubor z EAS
2. Nahraj přes **Transporter** app
3. V App Store Connect → **TestFlight** → **iOS Builds**

---

### **Krok 6: Přidej testery**

1. V App Store Connect → **TestFlight** → **Internal Testing**
2. Klikni **+** u **Testers**
3. Přidej email adresy testerů
4. Testeři dostanou email s odkazem na TestFlight app

---

### **Krok 7: Vyplň metadata pro TestFlight**

1. **What to Test** (Co testovat):
```
Verze 1.0.0

Testujte prosím:
- Přidání a správu oslav (narozeniny, svátky)
- Import z kontaktů
- Notifikace a připomenutí
- Checklisty
- Premium funkce (zkuste si koupit týdenní/roční předplatné)
- Synchronizaci s iCloud
- Změny jazyka a tématu

Známé problémy: žádné

Děkujeme za testování!
```

2. **Export Compliance**: Běžně vyberte **No**

---

## 🎯 Před odesláním zkontroluj:

### **Funkční testování**
- [ ] Aplikace se spustí bez crashe
- [ ] Můžu přidat oslavu
- [ ] Notifikace fungují
- [ ] Premium modal se zobrazí
- [ ] Onboarding se zobrazí při prvním spuštění
- [ ] iCloud sync funguje (pokud Premium)
- [ ] Témata se mění správně
- [ ] Jazyk se mění správně

### **Metadata**
- [ ] Ikona aplikace (1024x1024)
- [ ] Screenshots (pokud chceš)
- [ ] Privacy policy (pokud požadováno)
- [ ] Age rating vyplněn

---

## 📝 Důležité příkazy:

```bash
# Build pro TestFlight
eas build --platform ios --profile production

# Submit na TestFlight
eas submit --platform ios

# Zkontroluj status buildu
eas build:list

# Zobraz build logy
eas build:view [BUILD_ID]

# Update app konfigurace
eas update:configure
```

---

## 🔧 Troubleshooting:

### **Problém: Build selhává**
- Zkontroluj `app.json` - správný bundleIdentifier
- Zkontroluj Apple Developer účet - platné certifikáty
- Vyčisti cache: `rm -rf node_modules && npm install`

### **Problém: In-App Purchases nefungují**
- Zkontroluj Product IDs v App Store Connect
- Musí být ve stavu "Ready to Submit"
- Subscription Group musí být vytvořen
- Počkej 2-3 hodiny na Apple propagaci

### **Problém: Onboarding se zobrazuje pořád**
```bash
# Vymaž AsyncStorage (během vývoje)
# V iOS Simulatoru: Device > Erase All Content and Settings
```

---

## ✅ Hotovo!

Po dokončení těchto kroků bude tvoje aplikace na TestFlight a testeři ji budou moci stáhnout a testovat!

**Další kroky**:
1. Získej feedback od testerů
2. Oprav bugy (pokud nějaké jsou)
3. Přidej další featury (volitelně)
4. Submit na App Store Review (až budeš připraven)

---

## 📞 Potřebuješ pomoc?

- **EAS Build dokumentace**: https://docs.expo.dev/build/introduction/
- **TestFlight dokumentace**: https://developer.apple.com/testflight/
- **In-App Purchases**: https://developer.apple.com/in-app-purchase/

Hodně štěstí! 🚀


