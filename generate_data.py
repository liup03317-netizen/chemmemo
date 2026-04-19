import json

equations = []
levels = []

def add_level(id_val, title, eqs):
    levels.append({
        "id": id_val,
        "title": title,
        "equations": [eq["id"] for eq in eqs],
        "isUnlocked": False,
        "isCompleted": False
    })
    equations.extend(eqs)

# Helper for subscripts
def sub(formula):
    subs = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")
    return formula.translate(subs)

# Helper to split coefficient and formula and apply subscripts only to formula
import re
def parse_term(term):
    match = re.match(r'^(\d*)(.*)$', term)
    if match:
        coeff = match.group(1)
        formula = match.group(2)
        return coeff + sub(formula)
    return term

def parse_terms(terms):
    return [parse_term(t) for t in terms]

# --- 初中化学 ---

add_level("lvl-chuzhong-2", "第二单元：我们周围的空气", [
    {"id": "eq-p-o2", "reactants": ["4P", "5O2"], "products": ["2P2O5"], "conditions": "点燃", "type": "combination", "description": "红磷燃烧产生大量白烟"},
    {"id": "eq-s-o2", "reactants": ["S", "O2"], "products": ["SO2"], "conditions": "点燃", "type": "combination", "description": "硫在氧气中燃烧，蓝紫色火焰，生成刺激性气味气体"},
    {"id": "eq-c-o2", "reactants": ["C", "O2"], "products": ["CO2"], "conditions": "点燃", "type": "combination", "description": "碳充分燃烧生成二氧化碳"},
    {"id": "eq-fe-o2", "reactants": ["3Fe", "2O2"], "products": ["Fe3O4"], "conditions": "点燃", "type": "combination", "description": "铁丝在氧气中剧烈燃烧，火星四射，生成黑色固体"},
    {"id": "eq-h2o2-o2", "reactants": ["2H2O2"], "products": ["2H2O", "O2↑"], "conditions": "MnO₂", "type": "decomposition", "description": "过氧化氢在二氧化锰催化下分解制氧气"},
    {"id": "eq-kmno4-o2", "reactants": ["2KMnO4"], "products": ["K2MnO4", "MnO2", "O2↑"], "conditions": "加热", "type": "decomposition", "description": "高锰酸钾受热分解制氧气"},
    {"id": "eq-kclo3-o2", "reactants": ["2KClO3"], "products": ["2KCl", "3O2↑"], "conditions": "MnO₂/加热", "type": "decomposition", "description": "氯酸钾受热分解制氧气"}
])

add_level("lvl-chuzhong-4", "第四单元：自然界的水", [
    {"id": "eq-h2o-electrolysis", "reactants": ["2H2O"], "products": ["2H2↑", "O2↑"], "conditions": "通电", "type": "decomposition", "description": "水通电分解（正氧负氢，体积比1:2）"},
    {"id": "eq-h2-o2", "reactants": ["2H2", "O2"], "products": ["2H2O"], "conditions": "点燃", "type": "combination", "description": "氢气燃烧，产生淡蓝色火焰"}
])

add_level("lvl-chuzhong-6", "第六单元：碳和碳的氧化物", [
    {"id": "eq-c-o2-incomp", "reactants": ["2C", "O2"], "products": ["2CO"], "conditions": "点燃", "type": "combination", "description": "碳不充分燃烧生成一氧化碳"},
    {"id": "eq-c-co2", "reactants": ["C", "CO2"], "products": ["2CO"], "conditions": "高温", "type": "combination", "description": "二氧化碳通过炽热碳层"},
    {"id": "eq-co-o2", "reactants": ["2CO", "O2"], "products": ["2CO2"], "conditions": "点燃", "type": "combination", "description": "一氧化碳燃烧，产生蓝色火焰"},
    {"id": "eq-co-cuo", "reactants": ["CO", "CuO"], "products": ["Cu", "CO2"], "conditions": "加热", "type": "redox", "description": "一氧化碳还原氧化铜，黑色变红色"},
    {"id": "eq-co-fe2o3", "reactants": ["3CO", "Fe2O3"], "products": ["2Fe", "3CO2"], "conditions": "高温", "type": "redox", "description": "一氧化碳还原氧化铁（高炉炼铁原理）"},
    {"id": "eq-c-cuo", "reactants": ["C", "2CuO"], "products": ["2Cu", "CO2↑"], "conditions": "高温", "type": "displacement", "description": "碳还原氧化铜"},
    {"id": "eq-caco3-hcl", "reactants": ["CaCO3", "2HCl"], "products": ["CaCl2", "H2O", "CO2↑"], "conditions": "", "type": "double-decomposition", "description": "实验室制取二氧化碳"},
    {"id": "eq-co2-h2o", "reactants": ["CO2", "H2O"], "products": ["H2CO3"], "conditions": "", "type": "combination", "description": "二氧化碳溶于水生成碳酸"},
    {"id": "eq-h2co3-decomp", "reactants": ["H2CO3"], "products": ["H2O", "CO2↑"], "conditions": "", "type": "decomposition", "description": "碳酸不稳定分解"},
    {"id": "eq-co2-caoh2", "reactants": ["CO2", "Ca(OH)2"], "products": ["CaCO3↓", "H2O"], "conditions": "", "type": "double-decomposition", "description": "二氧化碳使澄清石灰水变浑浊（检验CO2）"}
])

add_level("lvl-chuzhong-7", "第七单元：燃料及其利用", [
    {"id": "eq-ch4-o2", "reactants": ["CH4", "2O2"], "products": ["CO2", "2H2O"], "conditions": "点燃", "type": "redox", "description": "甲烷燃烧，产生明亮蓝色火焰"},
    {"id": "eq-c2h5oh-o2", "reactants": ["C2H5OH", "3O2"], "products": ["2CO2", "3H2O"], "conditions": "点燃", "type": "redox", "description": "乙醇（酒精）燃烧"}
])

add_level("lvl-chuzhong-8", "第八单元：金属和金属材料", [
    {"id": "eq-mg-o2", "reactants": ["2Mg", "O2"], "products": ["2MgO"], "conditions": "点燃", "type": "combination", "description": "镁带燃烧，发出耀眼白光"},
    {"id": "eq-al-o2", "reactants": ["4Al", "3O2"], "products": ["2Al2O3"], "conditions": "点燃", "type": "combination", "description": "铝在氧气中燃烧（或表面形成致密氧化膜）"},
    {"id": "eq-cu-o2", "reactants": ["2Cu", "O2"], "products": ["2CuO"], "conditions": "加热", "type": "combination", "description": "铜受热变黑"},
    {"id": "eq-zn-h2so4", "reactants": ["Zn", "H2SO4"], "products": ["ZnSO4", "H2↑"], "conditions": "", "type": "displacement", "description": "实验室制氢气"},
    {"id": "eq-fe-hcl", "reactants": ["Fe", "2HCl"], "products": ["FeCl2", "H2↑"], "conditions": "", "type": "displacement", "description": "铁与盐酸反应，溶液变浅绿色"},
    {"id": "eq-mg-hcl", "reactants": ["Mg", "2HCl"], "products": ["MgCl2", "H2↑"], "conditions": "", "type": "displacement", "description": "镁与盐酸反应，产生大量气泡"},
    {"id": "eq-fe-cuso4", "reactants": ["Fe", "CuSO4"], "products": ["FeSO4", "Cu"], "conditions": "", "type": "displacement", "description": "湿法炼铜：铁与硫酸铜反应，表面有红色物质析出"},
    {"id": "eq-cu-agno3", "reactants": ["Cu", "2AgNO3"], "products": ["Cu(NO3)2", "2Ag"], "conditions": "", "type": "displacement", "description": "铜与硝酸银反应，表面析出银白色物质，溶液变蓝"}
])

add_level("lvl-chuzhong-10", "第十单元：酸和碱", [
    {"id": "eq-naoh-hcl", "reactants": ["NaOH", "HCl"], "products": ["NaCl", "H2O"], "conditions": "", "type": "double-decomposition", "description": "中和反应：氢氧化钠与盐酸反应"},
    {"id": "eq-caoh2-h2so4", "reactants": ["Ca(OH)2", "H2SO4"], "products": ["CaSO4", "2H2O"], "conditions": "", "type": "double-decomposition", "description": "熟石灰改良酸性土壤（或中和反应）"},
    {"id": "eq-fe2o3-hcl", "reactants": ["Fe2O3", "6HCl"], "products": ["2FeCl3", "3H2O"], "conditions": "", "type": "double-decomposition", "description": "盐酸除铁锈，溶液变黄色"},
    {"id": "eq-fe2o3-h2so4", "reactants": ["Fe2O3", "3H2SO4"], "products": ["Fe2(SO4)3", "3H2O"], "conditions": "", "type": "double-decomposition", "description": "硫酸除铁锈"},
    {"id": "eq-cuo-h2so4", "reactants": ["CuO", "H2SO4"], "products": ["CuSO4", "H2O"], "conditions": "", "type": "double-decomposition", "description": "氧化铜与硫酸反应，溶液变蓝"},
    {"id": "eq-naoh-so2", "reactants": ["2NaOH", "SO2"], "products": ["Na2SO3", "H2O"], "conditions": "", "type": "double-decomposition", "description": "氢氧化钠吸收二氧化硫气体"},
    {"id": "eq-naoh-so3", "reactants": ["2NaOH", "SO3"], "products": ["Na2SO4", "H2O"], "conditions": "", "type": "double-decomposition", "description": "氢氧化钠吸收三氧化硫"}
])

add_level("lvl-chuzhong-11", "第十一单元：盐 化肥", [
    {"id": "eq-na2co3-hcl", "reactants": ["Na2CO3", "2HCl"], "products": ["2NaCl", "H2O", "CO2↑"], "conditions": "", "type": "double-decomposition", "description": "碳酸钠与盐酸反应（灭火器原理之一）"},
    {"id": "eq-nahco3-hcl", "reactants": ["NaHCO3", "HCl"], "products": ["NaCl", "H2O", "CO2↑"], "conditions": "", "type": "double-decomposition", "description": "碳酸氢钠与盐酸反应（治疗胃酸过多）"},
    {"id": "eq-na2co3-caoh2", "reactants": ["Na2CO3", "Ca(OH)2"], "products": ["CaCO3↓", "2NaOH"], "conditions": "", "type": "double-decomposition", "description": "纯碱制烧碱（苛化法）"},
    {"id": "eq-nacl-agno3", "reactants": ["NaCl", "AgNO3"], "products": ["AgCl↓", "NaNO3"], "conditions": "", "type": "double-decomposition", "description": "氯化钠与硝酸银反应，生成白色沉淀（检验Cl⁻）"},
    {"id": "eq-bacl2-h2so4", "reactants": ["BaCl2", "H2SO4"], "products": ["BaSO4↓", "2HCl"], "conditions": "", "type": "double-decomposition", "description": "氯化钡与硫酸反应，生成白色沉淀（检验SO4²⁻）"},
    {"id": "eq-nh4no3-naoh", "reactants": ["NH4NO3", "NaOH"], "products": ["NaNO3", "NH3↑", "H2O"], "conditions": "加热", "type": "double-decomposition", "description": "铵盐与碱反应放出氨气（检验NH4⁺）"}
])


# --- 高中化学 必修第一册 ---

add_level("lvl-gaozhong-b1-2", "必修一·第二章：海水中的重要元素—钠和氯", [
    {"id": "eq-hs-na-o2-room", "reactants": ["4Na", "O2"], "products": ["2Na2O"], "conditions": "", "type": "combination", "description": "钠在常温下被氧化，切面变暗"},
    {"id": "eq-hs-na-o2-heat", "reactants": ["2Na", "O2"], "products": ["Na2O2"], "conditions": "加热", "type": "combination", "description": "钠在空气中燃烧，黄色火焰，生成淡黄色固体"},
    {"id": "eq-hs-na-h2o", "reactants": ["2Na", "2H2O"], "products": ["2NaOH", "H2↑"], "conditions": "", "type": "redox", "description": "钠与水反应（浮、熔、游、响、红）"},
    {"id": "eq-hs-na2o2-h2o", "reactants": ["2Na2O2", "2H2O"], "products": ["4NaOH", "O2↑"], "conditions": "", "type": "redox", "description": "过氧化钠与水反应"},
    {"id": "eq-hs-na2o2-co2", "reactants": ["2Na2O2", "2CO2"], "products": ["2Na2CO3", "O2"], "conditions": "", "type": "redox", "description": "过氧化钠与二氧化碳反应（呼吸面具供氧）"},
    {"id": "eq-hs-nahco3-heat", "reactants": ["2NaHCO3"], "products": ["Na2CO3", "H2O", "CO2↑"], "conditions": "加热", "type": "decomposition", "description": "碳酸氢钠受热分解"},
    {"id": "eq-hs-na2co3-co2-h2o", "reactants": ["Na2CO3", "CO2", "H2O"], "products": ["2NaHCO3"], "conditions": "", "type": "combination", "description": "碳酸钠溶液吸收二氧化碳生成碳酸氢钠"},
    
    {"id": "eq-hs-cl2-h2", "reactants": ["H2", "Cl2"], "products": ["2HCl"], "conditions": "点燃或光照", "type": "combination", "description": "氢气在氯气中燃烧，苍白色火焰"},
    {"id": "eq-hs-cl2-cu", "reactants": ["Cu", "Cl2"], "products": ["CuCl2"], "conditions": "点燃", "type": "combination", "description": "铜在氯气中燃烧，棕黄色烟"},
    {"id": "eq-hs-cl2-fe", "reactants": ["2Fe", "3Cl2"], "products": ["2FeCl3"], "conditions": "点燃", "type": "combination", "description": "铁在氯气中燃烧，棕褐色烟"},
    {"id": "eq-hs-cl2-h2o", "reactants": ["Cl2", "H2O"], "products": ["HCl", "HClO"], "conditions": "", "type": "redox", "description": "氯气溶于水生成盐酸和次氯酸"},
    {"id": "eq-hs-hclo-light", "reactants": ["2HClO"], "products": ["2HCl", "O2↑"], "conditions": "光照", "type": "decomposition", "description": "次氯酸见光分解"},
    {"id": "eq-hs-cl2-naoh", "reactants": ["Cl2", "2NaOH"], "products": ["NaCl", "NaClO", "H2O"], "conditions": "", "type": "redox", "description": "氯气与氢氧化钠反应（制漂白液）"},
    {"id": "eq-hs-cl2-caoh2", "reactants": ["2Cl2", "2Ca(OH)2"], "products": ["CaCl2", "Ca(ClO)2", "2H2O"], "conditions": "", "type": "redox", "description": "氯气与石灰乳反应（制漂白粉）"}
])

add_level("lvl-gaozhong-b1-3", "必修一·第三章：铁 金属材料", [
    {"id": "eq-hs-fe-h2o", "reactants": ["3Fe", "4H2O(g)"], "products": ["Fe3O4", "4H2"], "conditions": "高温", "type": "redox", "description": "铁与水蒸气反应"},
    {"id": "eq-hs-feo-hcl", "reactants": ["FeO", "2HCl"], "products": ["FeCl2", "H2O"], "conditions": "", "type": "double-decomposition", "description": "氧化亚铁与盐酸反应"},
    {"id": "eq-hs-fe2o3-hcl", "reactants": ["Fe2O3", "6HCl"], "products": ["2FeCl3", "3H2O"], "conditions": "", "type": "double-decomposition", "description": "氧化铁与盐酸反应"},
    {"id": "eq-hs-fecl2-cl2", "reactants": ["2FeCl2", "Cl2"], "products": ["2FeCl3"], "conditions": "", "type": "redox", "description": "氯化亚铁被氯气氧化为氯化铁"},
    {"id": "eq-hs-fecl3-fe", "reactants": ["2FeCl3", "Fe"], "products": ["3FeCl2"], "conditions": "", "type": "redox", "description": "氯化铁溶液溶解铁粉"},
    {"id": "eq-hs-fecl3-cu", "reactants": ["2FeCl3", "Cu"], "products": ["2FeCl2", "CuCl2"], "conditions": "", "type": "redox", "description": "氯化铁腐蚀铜板（印刷电路板原理）"},
    {"id": "eq-hs-feoh2-o2-h2o", "reactants": ["4Fe(OH)2", "O2", "2H2O"], "products": ["4Fe(OH)3"], "conditions": "", "type": "redox", "description": "氢氧化亚铁在空气中被氧化（白色絮状沉淀迅速变灰绿，最后呈红褐色）"},
    
    {"id": "eq-hs-al-o2", "reactants": ["4Al", "3O2"], "products": ["2Al2O3"], "conditions": "加热", "type": "combination", "description": "铝受热剧烈氧化"},
    {"id": "eq-hs-al-naoh", "reactants": ["2Al", "2NaOH", "2H2O"], "products": ["2Na[Al(OH)4]", "3H2↑"], "conditions": "", "type": "redox", "description": "铝与氢氧化钠溶液反应，放出氢气"},
    {"id": "eq-hs-al2o3-naoh", "reactants": ["Al2O3", "2NaOH"], "products": ["2Na[Al(OH)4]", "H2O"], "conditions": "", "type": "double-decomposition", "description": "两性氧化物：氧化铝与氢氧化钠溶液反应"},
    {"id": "eq-hs-aloh3-naoh", "reactants": ["Al(OH)3", "NaOH"], "products": ["Na[Al(OH)4]"], "conditions": "", "type": "double-decomposition", "description": "两性氢氧化物：氢氧化铝溶解在强碱中"}
])

# --- 高中化学 必修第二册 ---

add_level("lvl-gaozhong-b2-5", "必修二·第五章：化工生产中的重要非金属元素", [
    {"id": "eq-hs-s-o2", "reactants": ["S", "O2"], "products": ["SO2"], "conditions": "点燃", "type": "combination", "description": "硫在氧气中燃烧"},
    {"id": "eq-hs-so2-o2", "reactants": ["2SO2", "O2"], "products": ["2SO3"], "conditions": "催化剂/加热", "type": "combination", "description": "二氧化硫催化氧化（可逆反应）"},
    {"id": "eq-hs-so2-h2o", "reactants": ["SO2", "H2O"], "products": ["H2SO3"], "conditions": "", "type": "combination", "description": "二氧化硫溶于水生成亚硫酸（可逆反应）"},
    {"id": "eq-hs-cu-h2so4-conc", "reactants": ["Cu", "2H2SO4(浓)"], "products": ["CuSO4", "SO2↑", "2H2O"], "conditions": "加热", "type": "redox", "description": "铜与浓硫酸反应"},
    {"id": "eq-hs-c-h2so4-conc", "reactants": ["C", "2H2SO4(浓)"], "products": ["CO2↑", "2SO2↑", "2H2O"], "conditions": "加热", "type": "redox", "description": "碳与浓硫酸反应"},
    
    {"id": "eq-hs-n2-h2", "reactants": ["N2", "3H2"], "products": ["2NH3"], "conditions": "高温高压/催化剂", "type": "combination", "description": "合成氨反应（可逆反应）"},
    {"id": "eq-hs-n2-o2", "reactants": ["N2", "O2"], "products": ["2NO"], "conditions": "放电或高温", "type": "combination", "description": "雷雨发庄稼：氮气与氧气反应生成一氧化氮"},
    {"id": "eq-hs-no-o2", "reactants": ["2NO", "O2"], "products": ["2NO2"], "conditions": "", "type": "combination", "description": "一氧化氮在空气中迅速氧化为红棕色二氧化氮"},
    {"id": "eq-hs-no2-h2o", "reactants": ["3NO2", "H2O"], "products": ["2HNO3", "NO"], "conditions": "", "type": "redox", "description": "二氧化氮溶于水生成硝酸"},
    {"id": "eq-hs-nh3-h2o", "reactants": ["NH3", "H2O"], "products": ["NH3·H2O"], "conditions": "", "type": "combination", "description": "氨气溶于水生成一水合氨"},
    {"id": "eq-hs-nh3-hcl", "reactants": ["NH3", "HCl"], "products": ["NH4Cl"], "conditions": "", "type": "combination", "description": "氨气与氯化氢相遇产生白烟"},
    {"id": "eq-hs-nh3-o2", "reactants": ["4NH3", "5O2"], "products": ["4NO", "6H2O"], "conditions": "催化剂/加热", "type": "redox", "description": "氨的催化氧化（工业制硝酸的第一步）"},
    {"id": "eq-hs-cu-hno3-dil", "reactants": ["3Cu", "8HNO3(稀)"], "products": ["3Cu(NO3)2", "2NO↑", "4H2O"], "conditions": "", "type": "redox", "description": "铜与稀硝酸反应，生成无色NO气体"},
    {"id": "eq-hs-cu-hno3-conc", "reactants": ["Cu", "4HNO3(浓)"], "products": ["Cu(NO3)2", "2NO2↑", "2H2O"], "conditions": "", "type": "redox", "description": "铜与浓硝酸反应，生成红棕色NO2气体"},
    {"id": "eq-hs-c-hno3-conc", "reactants": ["C", "4HNO3(浓)"], "products": ["CO2↑", "4NO2↑", "2H2O"], "conditions": "加热", "type": "redox", "description": "碳与浓硝酸反应"}
])

add_level("lvl-gaozhong-b2-7", "必修二·第七章：有机化合物", [
    {"id": "eq-hs-ch4-cl2", "reactants": ["CH4", "Cl2"], "products": ["CH3Cl", "HCl"], "conditions": "光照", "type": "substitution", "description": "甲烷的取代反应（第一步）"},
    {"id": "eq-hs-c2h4-br2", "reactants": ["C2H4", "Br2"], "products": ["CH2BrCH2Br"], "conditions": "", "type": "addition", "description": "乙烯与溴水发生加成反应，使溴水褪色"},
    {"id": "eq-hs-c2h4-h2o", "reactants": ["C2H4", "H2O"], "products": ["C2H5OH"], "conditions": "催化剂/加热加压", "type": "addition", "description": "乙烯水化法制乙醇"},
    {"id": "eq-hs-c2h5oh-o2-cu", "reactants": ["2C2H5OH", "O2"], "products": ["2CH3CHO", "2H2O"], "conditions": "Cu/加热", "type": "redox", "description": "乙醇催化氧化为乙醛"},
    {"id": "eq-hs-ch3cooh-na2co3", "reactants": ["2CH3COOH", "Na2CO3"], "products": ["2CH3COONa", "H2O", "CO2↑"], "conditions": "", "type": "double-decomposition", "description": "醋酸与碳酸钠反应（证明醋酸酸性大于碳酸）"},
    {"id": "eq-hs-esterification", "reactants": ["CH3COOH", "C2H5OH"], "products": ["CH3COOC2H5", "H2O"], "conditions": "浓H2SO4/加热", "type": "substitution", "description": "乙酸乙酯的酯化反应（可逆）"}
])

add_level("lvl-zhongkao", "终极挑战：中考模拟", [])
add_level("lvl-gaokao", "终极挑战：高考模拟", [])

# Post-processing: apply subscripts to formulas
for eq in equations:
    eq["reactants"] = parse_terms(eq["reactants"])
    eq["products"] = parse_terms(eq["products"])

# Post-processing: populate zhongkao and gaokao
for lvl in levels:
    if lvl["id"] == "lvl-zhongkao":
        lvl["equations"] = [eq["id"] for eq in equations if "hs-" not in eq["id"]]
    elif lvl["id"] == "lvl-gaokao":
        lvl["equations"] = [eq["id"] for eq in equations]

# Generate equations.ts
with open('src/data/equations.ts', 'w', encoding='utf-8') as f:
    f.write("import { Equation } from '../types';\n\n")
    f.write("export const equations: Equation[] = [\n")
    for eq in equations:
        f.write("  {\n")
        f.write(f"    id: '{eq['id']}',\n")
        f.write(f"    reactants: {json.dumps(eq['reactants'], ensure_ascii=False)},\n")
        f.write(f"    products: {json.dumps(eq['products'], ensure_ascii=False)},\n")
        f.write(f"    conditions: '{eq['conditions']}',\n")
        f.write(f"    type: '{eq['type']}',\n")
        f.write(f"    description: '{eq['description']}',\n")
        f.write("  },\n")
    f.write("];\n")

# Generate levels.ts
with open('src/data/levels.ts', 'w', encoding='utf-8') as f:
    f.write("import { Level } from '../types';\n")
    f.write("import { equations } from './equations';\n\n")
    f.write("export const initialLevels: Level[] = [\n")
    for lvl in levels:
        f.write("  {\n")
        f.write(f"    id: '{lvl['id']}',\n")
        f.write(f"    title: '{lvl['title']}',\n")
        
        if lvl["id"] == "lvl-zhongkao":
            f.write("    equations: equations.filter(eq => !eq.id.includes('hs-')).map(eq => eq.id),\n")
        elif lvl["id"] == "lvl-gaokao":
            f.write("    equations: equations.map(eq => eq.id),\n")
        else:
            f.write(f"    equations: {json.dumps(lvl['equations'])},\n")
            
        f.write(f"    isUnlocked: {'true' if lvl['id'] == 'lvl-chuzhong-2' else 'false'},\n")
        f.write("    isCompleted: false,\n")
        f.write("  },\n")
    f.write("];\n")

print(f"Generated {len(equations)} equations and {len(levels)} levels.")
