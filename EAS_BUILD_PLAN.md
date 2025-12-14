# EAS Build - Plán pro pozdější implementaci

## ✅ Současný stav (Vývoj)

**Aktuálně používáte:**
- Expo Go / Development Client pro testování
- Lokální buildy přes `npx expo run:ios`
- Všechny funkce fungují

**To je v pořádku!** Pro vývoj je to ideální setup.

## 🚀 Přechod na EAS Build (Až bude aplikace ready)

### Kdy přejít na EAS Build?

**Přechod na EAS Build je vhodný když:**
1. ✅ Aplikace je funkčně hotová
2. ✅ Všechny features jsou implementované
3. ✅ Chcete testovat standalone build (bez počítače)
4. ✅ Jste připraveni na App Store submission

### Je to možné kdykoli?

**ANO!** EAS Build lze přidat kdykoli bez změny kódu:

1. **Žádné změny v kódu nejsou potřeba**
   - Váš současný kód je kompatibilní s EAS Build
   - Expo Router, všechny moduly, vše funguje stejně

2. **Jednoduchý proces:**
   ```bash
   # Krok 1: Nainstalovat EAS CLI (jednou)
   npm install -g eas-cli
   
   # Krok 2: Přihlásit se
   eas login
   
   # Krok 3: Inicializovat EAS (vytvoří eas.json)
   eas build:configure
   
   # Krok 4: Vytvořit development build
   eas build --profile development --platform ios
   
   # Krok 5: Vytvořit production build (až bude ready)
   eas build --profile production --platform ios
   ```

3. **Žádné breaking changes**
   - Váš `app.json` zůstane stejný
   - Všechny moduly fungují stejně
   - Pouze přidáte `eas.json` konfiguraci

## 📋 Co bude potřeba (až bude čas)

### 1. EAS Account
- Vytvořit účet na https://expo.dev
- Je zdarma pro development buildy
- Placené pouze pro production buildy (ale máte free tier)

### 2. Apple Developer Account
- Pro iOS production buildy
- $99/rok
- Nutné pro App Store submission

### 3. Konfigurace (eas.json)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 🎯 Doporučený postup (až bude ready)

### Fáze 1: Development Build (Testování)
```bash
eas build --profile development --platform ios
```
- Vytvoří standalone aplikaci
- Funguje bez počítače
- Obsahuje všechny nativní moduly
- Testování jako finální verze

### Fáze 2: Preview Build (Beta testování)
```bash
eas build --profile preview --platform ios
```
- Pro testování s beta testry
- Distribuce přes TestFlight (iOS)

### Fáze 3: Production Build (App Store)
```bash
eas build --profile production --platform ios
```
- Finální verze pro App Store
- Automaticky podepsaná
- Ready pro submission

## ⚠️ Co je důležité vědět

### Co funguje i bez EAS Build:
- ✅ Všechny funkce aplikace
- ✅ Lokální storage (AsyncStorage)
- ✅ Notifikace (v development clientu)
- ✅ Kontakty (v development clientu)
- ✅ Reklamy (v development clientu)

### Co vyžaduje EAS Build pro production:
- 📱 Standalone aplikace (bez Expo Go)
- 🍎 App Store submission
- 📦 Optimalizované buildy
- 🔒 Code signing

## 📝 Checklist (až bude čas)

- [ ] Aplikace je funkčně hotová
- [ ] Všechny features jsou otestované
- [ ] Vytvořit EAS account
- [ ] Spustit `eas build:configure`
- [ ] Vytvořit development build
- [ ] Otestovat standalone aplikaci
- [ ] Vytvořit production build
- [ ] Submit do App Store

## 🎉 Závěr

**Ano, přechod na EAS Build je možný kdykoli později!**

- ✅ Žádné změny v kódu nejsou potřeba
- ✅ Váš současný setup je v pořádku
- ✅ EAS Build lze přidat kdykoli
- ✅ Proces je jednoduchý a bezpečný

**Doporučení:** Pokračujte ve vývoji s aktuálním setupem. Až bude aplikace ready, přidejte EAS Build. Je to otázka několika příkazů, ne týdnů práce.






