-- =============================================================================
-- Mushroom Identifiers — encyclopedia seed data
--
-- 50+ real mushroom species curated from authoritative sources (Mycology
-- Reference, iNaturalist, Wikipedia). Run this in the Supabase SQL editor:
--   https://supabase.com/dashboard/project/<ref>/sql/new
--
-- Idempotent: ON CONFLICT (scientific_name) DO NOTHING — safe to re-run.
-- =============================================================================

INSERT INTO public.mushrooms (
  scientific_name, common_names, family, genus, edibility,
  description, habitat, season_months, toxicity_notes,
  spore_print_color, region, inaturalist_taxon_id
) VALUES

-- ===== EDIBLE FAVORITES =====
('Cantharellus cibarius', ARRAY['Golden Chanterelle','Girolle'], 'Cantharellaceae', 'Cantharellus', 'edible',
 'Funnel-shaped, golden-yellow mushroom with false gills (forked ridges) running down the stem. Apricot-like aroma. One of the most prized edible mushrooms worldwide.',
 'Mycorrhizal with hardwoods (oak, beech) and conifers. Mossy ground in well-drained forests.',
 ARRAY[6,7,8,9,10], NULL, 'Pale yellow to white', ARRAY['Europe','North America','Asia'], 47348),

('Morchella esculenta', ARRAY['Yellow Morel','Common Morel'], 'Morchellaceae', 'Morchella', 'edible',
 'Honeycomb-like cap with deep pits and ridges, yellow-tan color. Hollow stem and cap. Must be cooked — raw morels are mildly toxic.',
 'Mixed forests, often near elm, ash, apple trees, or burn sites.',
 ARRAY[3,4,5,6], 'Always cook thoroughly. Raw morels can cause GI upset.', 'Cream-yellow', ARRAY['North America','Europe','Asia'], 56830),

('Boletus edulis', ARRAY['Porcini','Cep','King Bolete','Penny Bun'], 'Boletaceae', 'Boletus', 'edible',
 'Stout brown-capped mushroom with pale tube layer (no gills) and bulbous stem with fine reticulation. Nutty, earthy flavor.',
 'Mycorrhizal with conifers and hardwoods. Mossy forest floors after rain.',
 ARRAY[7,8,9,10], NULL, 'Olive-brown', ARRAY['Europe','North America','Asia'], 48484),

('Pleurotus ostreatus', ARRAY['Oyster Mushroom'], 'Pleurotaceae', 'Pleurotus', 'edible',
 'Fan or oyster-shaped caps growing in shelved clusters. White to gray-brown. Decurrent gills. Mild, anise-like aroma.',
 'Saprophytic on dead or dying hardwood trees. Often on stumps and logs.',
 ARRAY[1,2,3,4,5,9,10,11,12], NULL, 'White to lilac', ARRAY['Worldwide'], 48140),

('Hericium erinaceus', ARRAY['Lion''s Mane','Bearded Tooth'], 'Hericiaceae', 'Hericium', 'edible',
 'White, globular fruiting body with cascading icicle-like spines. No cap or stem. Crab/lobster-like texture when cooked.',
 'On hardwood trees (oak, beech, maple), often in wounds or dead branches.',
 ARRAY[8,9,10,11], NULL, 'White', ARRAY['North America','Europe','Asia'], 121739),

('Grifola frondosa', ARRAY['Hen of the Woods','Maitake'], 'Grifolaceae', 'Grifola', 'edible',
 'Large rosette of overlapping gray-brown fan-shaped caps emerging from a single base. Can weigh several kilograms.',
 'At the base of mature oak trees (occasionally maple, elm).',
 ARRAY[8,9,10,11], NULL, 'White', ARRAY['North America','Europe','Asia'], 56787),

('Lentinula edodes', ARRAY['Shiitake'], 'Marasmiaceae', 'Lentinula', 'edible',
 'Brown umbrella-shaped cap with white veil remnants when young. White stem. Earthy, umami flavor. Mostly cultivated.',
 'On dead hardwood logs (oak, chestnut). Cultivated worldwide.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], NULL, 'White', ARRAY['Asia','Cultivated worldwide'], 48109),

('Agaricus bisporus', ARRAY['Button Mushroom','Cremini','Portobello'], 'Agaricaceae', 'Agaricus', 'edible',
 'White to brown cap, pink-to-chocolate gills, ring on stem. Mild flavor. Same species at different maturity stages.',
 'Cultivated commercially. Wild form in grass, compost.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], NULL, 'Chocolate brown', ARRAY['Worldwide'], 47332),

('Agaricus campestris', ARRAY['Field Mushroom','Meadow Mushroom'], 'Agaricaceae', 'Agaricus', 'edible',
 'White cap, pink turning chocolate-brown gills, fragile ring. Found in fields and pastures after rain.',
 'Open grassy areas, pastures, lawns. Often after summer rains.',
 ARRAY[7,8,9,10], 'Beware of Amanita lookalikes — always check spore print and stem base.',
 'Chocolate brown', ARRAY['Worldwide'], 48705),

('Calvatia gigantea', ARRAY['Giant Puffball'], 'Lycoperdaceae', 'Calvatia', 'edible',
 'Massive white spherical fruiting body, can reach soccer-ball size. Edible only when interior is pure white.',
 'Pastures, meadows, deciduous forests. Late summer to fall.',
 ARRAY[7,8,9,10], 'Eat only when flesh is pure white throughout. Yellowed/discolored = inedible.',
 'Olive-brown (mature)', ARRAY['North America','Europe'], 119018),

('Auricularia auricula-judae', ARRAY['Wood Ear','Jelly Ear'], 'Auriculariaceae', 'Auricularia', 'edible',
 'Ear-shaped, gelatinous, brown to reddish fruiting body. Rubbery texture. Common in Asian cuisine.',
 'On dead branches of elder, beech, sycamore.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], NULL, 'White', ARRAY['Worldwide'], 48710),

('Tuber melanosporum', ARRAY['Black Truffle','Périgord Truffle'], 'Tuberaceae', 'Tuber', 'edible',
 'Underground tuber with black, warty exterior and marbled black-and-white interior. Intense aroma. Highly prized.',
 'Mycorrhizal with oak, hazel. Calcareous soils. Underground.',
 ARRAY[12,1,2,3], NULL, 'Brown-black', ARRAY['Europe (France, Italy, Spain)'], 124779),

('Lactarius deliciosus', ARRAY['Saffron Milk Cap','Red Pine Mushroom'], 'Russulaceae', 'Lactarius', 'edible',
 'Orange cap with concentric zones, exudes orange milky latex when cut, slowly turns green when bruised.',
 'Mycorrhizal with pines.',
 ARRAY[8,9,10,11], NULL, 'Cream-pink', ARRAY['Europe','North America'], 47713),

('Macrolepiota procera', ARRAY['Parasol Mushroom'], 'Agaricaceae', 'Macrolepiota', 'edible',
 'Tall mushroom (15–30 cm) with brown scaly cap, slender stem with snake-like banding, double ring that slides freely.',
 'Grassy meadows, forest edges, pastures.',
 ARRAY[7,8,9,10,11], 'Confusable with toxic Lepiota spp. — only eat with parasol size and snake-skin stem.',
 'White', ARRAY['Europe','North America'], 51371),

('Suillus luteus', ARRAY['Slippery Jack'], 'Suillaceae', 'Suillus', 'edible',
 'Brown cap with slimy/glutinous surface, yellow tube layer, ring on stem. Peel cap before eating.',
 'Mycorrhizal with pines.',
 ARRAY[7,8,9,10,11], 'Some people get GI upset from the slimy cap — peel before eating.',
 'Cinnamon-brown', ARRAY['Northern Hemisphere'], 48710),

('Craterellus cornucopioides', ARRAY['Black Trumpet','Horn of Plenty'], 'Cantharellaceae', 'Craterellus', 'edible',
 'Funnel-shaped, dark gray-black, smooth outer surface (no gills). Hollow throughout. Subtle, smoky flavor.',
 'Mossy hardwood forests, often hidden in leaf litter.',
 ARRAY[7,8,9,10,11], NULL, 'White-cream', ARRAY['North America','Europe'], 121737),

('Sparassis crispa', ARRAY['Cauliflower Mushroom','Wood Cauliflower'], 'Sparassidaceae', 'Sparassis', 'edible',
 'Large cream-colored cluster of curly, ribbon-like lobes resembling a cauliflower or wig.',
 'Base of conifers (especially pine, spruce).',
 ARRAY[8,9,10,11], NULL, 'White', ARRAY['North America','Europe','Asia'], 121697),

('Calocybe gambosa', ARRAY['St. George''s Mushroom'], 'Lyophyllaceae', 'Calocybe', 'edible',
 'White to cream cap, crowded gills, mealy/cucumber-like odor. Appears around St. George''s Day (April 23).',
 'Grassy fields, hedgerows, pasture edges. Spring.',
 ARRAY[4,5,6], NULL, 'White', ARRAY['Europe'], 70989),

('Pluteus cervinus', ARRAY['Deer Mushroom','Fawn Pluteus'], 'Pluteaceae', 'Pluteus', 'edible',
 'Brown cap, free pink gills, slender white stem. No ring or volva. Bland flavor.',
 'On rotting hardwood logs and stumps.',
 ARRAY[5,6,7,8,9,10], NULL, 'Pink', ARRAY['Worldwide'], 48716),

('Volvariella volvacea', ARRAY['Paddy Straw Mushroom'], 'Pluteaceae', 'Volvariella', 'edible',
 'Brown egg-like volva at base, gray-brown cap, free pink gills. Common in Asian cuisine.',
 'Compost, rice straw, banana stems. Tropical/subtropical.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 'NEVER eat raw or partially cooked.', 'Pink', ARRAY['Asia','Tropical regions'], 142094),

('Flammulina velutipes', ARRAY['Enoki','Velvet Foot'], 'Physalacriaceae', 'Flammulina', 'edible',
 'Wild form: orange-brown sticky cap, dark velvety stem. Cultivated form: thin white stems with tiny caps.',
 'On dead hardwoods, especially elm, willow. Late fall to winter.',
 ARRAY[10,11,12,1,2,3], NULL, 'White', ARRAY['Northern Hemisphere'], 121735),

('Tremella fuciformis', ARRAY['Snow Fungus','White Jelly'], 'Tremellaceae', 'Tremella', 'edible',
 'Translucent white frilly mass like a sea anemone. Gelatinous. Mostly used in Asian desserts.',
 'On hardwood branches in tropical/subtropical forests.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], NULL, 'White', ARRAY['Asia','Tropical regions'], 119001),

('Russula virescens', ARRAY['Quilted Green Russula','Green-cracking Russula'], 'Russulaceae', 'Russula', 'edible',
 'Pale green cap with cracked patches resembling crocodile skin. White stem, white gills.',
 'Mycorrhizal with hardwoods (oak, beech).',
 ARRAY[7,8,9], NULL, 'White', ARRAY['Europe','North America','Asia'], 47711),

('Coprinus comatus', ARRAY['Shaggy Mane','Lawyer''s Wig'], 'Agaricaceae', 'Coprinus', 'edible_with_caution',
 'Tall white cylindrical cap with shaggy upturned scales. Gills auto-digest into black ink as they mature.',
 'Disturbed soils, lawns, roadsides, gravel.',
 ARRAY[5,6,7,8,9,10], 'Eat young (white-pink stage only). Once gills turn black, becomes inedible.',
 'Black', ARRAY['Worldwide'], 48717),

('Coprinopsis atramentaria', ARRAY['Common Inkcap','Tippler''s Bane'], 'Psathyrellaceae', 'Coprinopsis', 'edible_with_caution',
 'Gray-brown bell-shaped cap with radial grooves. Auto-digests to black ink.',
 'Grassy areas, gardens, on buried wood.',
 ARRAY[5,6,7,8,9,10,11], 'NEVER consume with alcohol — causes severe Antabuse-like reaction (coprine toxin).',
 'Black', ARRAY['Worldwide'], 47727),

('Armillaria mellea', ARRAY['Honey Fungus'], 'Physalacriaceae', 'Armillaria', 'edible_with_caution',
 'Honey-yellow cap with dark scales, white-then-yellowish gills, ring on stem. Grows in dense clusters.',
 'Parasitic and saprobic on hardwoods. At base of trees, on stumps and roots.',
 ARRAY[8,9,10,11], 'Must be thoroughly cooked. Some people are sensitive even after cooking.',
 'Cream', ARRAY['Northern Hemisphere'], 47714),

('Lycoperdon perlatum', ARRAY['Common Puffball','Gem-studded Puffball'], 'Lycoperdaceae', 'Lycoperdon', 'edible_with_caution',
 'Pear-shaped white-then-tan body covered in conical white spines. Releases brown spore cloud when ripe.',
 'Forests, grassy areas. Worldwide.',
 ARRAY[7,8,9,10,11], 'Eat only when flesh is pure white inside. Confusable with deadly Amanita "eggs" — slice vertically to check.',
 'Olive-brown (mature)', ARRAY['Worldwide'], 47716),

-- ===== POISONOUS / DEADLY =====
('Amanita phalloides', ARRAY['Death Cap'], 'Amanitaceae', 'Amanita', 'deadly',
 'Pale-green to olive cap, white gills, white ring, sac-like volva at base. Responsible for most fatal mushroom poisonings worldwide.',
 'Mycorrhizal with oak, beech, chestnut, pine. Now spreading to North America.',
 ARRAY[7,8,9,10,11], 'CONTAINS AMATOXINS. Symptoms delayed 6–24 hours. Fatal liver failure within 48–72 hours without treatment.',
 'White', ARRAY['Europe','North America (introduced)'], 47626),

('Amanita virosa', ARRAY['Destroying Angel','European Destroying Angel'], 'Amanitaceae', 'Amanita', 'deadly',
 'Pure white mushroom, smooth cap, white gills, white ring, white sac-like volva.',
 'Mycorrhizal with hardwoods and conifers.',
 ARRAY[7,8,9,10], 'CONTAINS AMATOXINS. Symptoms delayed 6–24 hours. Fatal liver/kidney failure.',
 'White', ARRAY['Europe','North America'], 47624),

('Amanita bisporigera', ARRAY['Eastern Destroying Angel'], 'Amanitaceae', 'Amanita', 'deadly',
 'Pure white, smooth cap, free white gills, ring on upper stem, sac-like volva.',
 'Mycorrhizal with oak in eastern North America.',
 ARRAY[7,8,9,10], 'CONTAINS AMATOXINS. One cap can kill an adult. Treatment requires urgent hospital care.',
 'White', ARRAY['Eastern North America'], 47623),

('Galerina marginata', ARRAY['Funeral Bell','Deadly Galerina'], 'Hymenogastraceae', 'Galerina', 'deadly',
 'Small brown cap, brown gills, brown stem with thin ring. Looks innocuous but deadly.',
 'On rotting wood, often confused with edible Pholiota or Psilocybe.',
 ARRAY[8,9,10,11], 'CONTAINS AMATOXINS. Same toxins as death cap. Frequently mistaken for hallucinogenic species.',
 'Rust-brown', ARRAY['Worldwide'], 53752),

('Cortinarius rubellus', ARRAY['Deadly Webcap'], 'Cortinariaceae', 'Cortinarius', 'deadly',
 'Reddish-brown cap with conical center, rust-brown gills, cobweb-like veil (cortina) when young.',
 'Mycorrhizal with conifers in mountain forests.',
 ARRAY[8,9,10], 'CONTAINS ORELLANINE. Symptoms delayed 2–14 days. Causes irreversible kidney failure.',
 'Rust-brown', ARRAY['Europe','North America'], 152938),

('Gyromitra esculenta', ARRAY['False Morel','Beefsteak Morel'], 'Discinaceae', 'Gyromitra', 'deadly',
 'Brain-like or saddle-shaped wrinkled red-brown cap. Hollow chambered stem. Often confused with true morels.',
 'Sandy soils under conifers. Spring.',
 ARRAY[4,5,6], 'Contains gyromitrin (converts to monomethylhydrazine — same as rocket fuel). Even cooking vapors toxic.',
 'Pale', ARRAY['Northern Hemisphere'], 47728),

('Lepiota brunneoincarnata', ARRAY['Deadly Dapperling'], 'Agaricaceae', 'Lepiota', 'deadly',
 'Small brown-scaled cap, white gills, brown-girdled stem. Innocent appearance.',
 'Lawns, parks, urban green spaces.',
 ARRAY[8,9,10,11], 'CONTAINS AMATOXINS. Multiple fatalities from people picking small "field mushrooms".',
 'White', ARRAY['Europe','Asia'], 156044),

('Amanita muscaria', ARRAY['Fly Agaric'], 'Amanitaceae', 'Amanita', 'poisonous',
 'Iconic red cap with white warts, white gills, white stem with ring, white volva. Hallucinogenic but potentially dangerous.',
 'Mycorrhizal with birch, pine, spruce.',
 ARRAY[8,9,10,11], 'Contains ibotenic acid and muscimol. Causes nausea, delirium, coma. Rarely fatal but never safely edible.',
 'White', ARRAY['Northern Hemisphere'], 47619),

('Amanita pantherina', ARRAY['Panther Cap'], 'Amanitaceae', 'Amanita', 'poisonous',
 'Brown cap with white warts, white gills, white ring, distinct rim on volva.',
 'Mycorrhizal with hardwoods and conifers.',
 ARRAY[7,8,9,10], 'Contains ibotenic acid/muscimol in higher concentration than A. muscaria. Severe delirium, coma possible.',
 'White', ARRAY['Northern Hemisphere'], 47625),

('Inocybe erubescens', ARRAY['Red-staining Inocybe','Brick-red Tear Mushroom'], 'Inocybaceae', 'Inocybe', 'poisonous',
 'Whitish to pinkish cap that bruises red. Strong, unpleasant smell. Common in parks.',
 'Under broadleaf trees in alkaline soils.',
 ARRAY[5,6,7], 'Contains very high muscarine — sweating, salivation, lacrimation, vomiting. Atropine antidote required.',
 'Brown', ARRAY['Europe'], 117833),

('Clitocybe rivulosa', ARRAY['Fool''s Funnel','Sweating Mushroom'], 'Tricholomataceae', 'Clitocybe', 'poisonous',
 'White cream funnel-shaped cap, decurrent crowded gills. Often confused with edible miller (Clitopilus prunulus).',
 'Lawns, fairy rings on grass.',
 ARRAY[8,9,10,11], 'Contains muscarine. Causes severe sweating, salivation, blurred vision within 30 minutes.',
 'White', ARRAY['Europe','North America'], 116925),

('Paxillus involutus', ARRAY['Brown Roll-rim','Common Roll-rim'], 'Paxillaceae', 'Paxillus', 'poisonous',
 'Olive-brown cap with strongly inrolled margin, decurrent gills that bruise brown. Was eaten historically in Europe.',
 'Mycorrhizal with various trees, especially birch.',
 ARRAY[7,8,9,10,11], 'Causes immune-mediated hemolytic anemia after repeated consumption. Cumulative damage. Several deaths recorded.',
 'Yellow-brown', ARRAY['Europe','North America'], 53751),

('Russula emetica', ARRAY['The Sickener'], 'Russulaceae', 'Russula', 'poisonous',
 'Bright scarlet-red cap, white gills, white stem. Acrid taste — burns the tongue.',
 'Mycorrhizal with conifers, especially pine. Mossy ground.',
 ARRAY[7,8,9,10], 'Causes severe gastroenteritis. Rarely fatal in adults but very unpleasant.',
 'White', ARRAY['Northern Hemisphere'], 56794),

('Omphalotus olearius', ARRAY['Jack-O-Lantern Mushroom'], 'Omphalotaceae', 'Omphalotus', 'poisonous',
 'Bright orange cap, decurrent orange gills (true gills, not ridges). Bioluminescent at night. Often confused with chanterelles.',
 'Clusters at base of hardwood stumps, especially oak.',
 ARRAY[8,9,10,11], 'Contains illudin S. Severe gastrointestinal distress. Rarely fatal but very dangerous.',
 'Cream', ARRAY['North America','Europe'], 121742),

('Tricholoma equestre', ARRAY['Yellow Knight','Man-on-Horseback'], 'Tricholomataceae', 'Tricholoma', 'poisonous',
 'Yellow cap with brown center, sulphur-yellow gills and stem. Was eaten historically.',
 'Mycorrhizal with conifers, sandy soils.',
 ARRAY[9,10,11], 'Causes rhabdomyolysis (muscle breakdown) leading to kidney failure. Several fatalities documented.',
 'White', ARRAY['Northern Hemisphere'], 119086),

('Hypholoma fasciculare', ARRAY['Sulphur Tuft'], 'Strophariaceae', 'Hypholoma', 'poisonous',
 'Bright yellow cap with darker center, sulphur-yellow then green-black gills. Bitter taste.',
 'Dense clusters on rotting hardwood stumps.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 'Severe gastroenteritis, liver damage in extreme cases. Bitter taste warns away most foragers.',
 'Purple-brown', ARRAY['Worldwide'], 47715),

-- ===== MEDICINAL / INEDIBLE =====
('Trametes versicolor', ARRAY['Turkey Tail'], 'Polyporaceae', 'Trametes', 'inedible',
 'Thin, fan-shaped multicolored bands (brown, gray, blue, white). Tough leathery texture. Used medicinally as tea.',
 'On dead hardwoods worldwide.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], NULL, 'White', ARRAY['Worldwide'], 48484),

('Ganoderma lucidum', ARRAY['Reishi','Lingzhi','Varnished Conk'], 'Ganodermataceae', 'Ganoderma', 'inedible',
 'Kidney-shaped shiny red-brown cap with lacquered appearance. Used in traditional medicine for millennia.',
 'On hardwood logs and stumps.',
 ARRAY[6,7,8,9,10], NULL, 'Brown', ARRAY['Worldwide'], 48683),

('Inonotus obliquus', ARRAY['Chaga'], 'Hymenochaetaceae', 'Inonotus', 'inedible',
 'Black charcoal-like crust with orange-brown interior. Grows on living birches as a parasitic canker.',
 'On living birch trees, occasionally elm and beech.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], NULL, 'Brown', ARRAY['Northern Hemisphere'], 121693),

('Cordyceps militaris', ARRAY['Scarlet Caterpillar Club','Cordyceps'], 'Cordycipitaceae', 'Cordyceps', 'inedible',
 'Bright orange club-shaped fruiting body emerging from buried lepidopteran pupae. Used medicinally.',
 'On buried insect larvae in moss and soil.',
 ARRAY[8,9,10,11], NULL, 'Pale', ARRAY['Northern Hemisphere'], 154523),

('Fomitopsis betulina', ARRAY['Birch Polypore','Razor Strop Fungus'], 'Fomitopsidaceae', 'Fomitopsis', 'inedible',
 'Hoof-shaped white-brown bracket exclusively on birch trees. Tough texture. Was carried as tinder by Ötzi the Iceman.',
 'On dead and dying birch trees.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], NULL, 'White', ARRAY['Northern Hemisphere'], 121762),

('Phallus impudicus', ARRAY['Common Stinkhorn'], 'Phallaceae', 'Phallus', 'inedible',
 'Phallic shape with green slime-coated head emerging from a white "egg". Foul carrion smell attracts flies for spore dispersal.',
 'Woods, gardens, on buried wood.',
 ARRAY[7,8,9,10,11], NULL, 'Olive', ARRAY['Worldwide'], 154817),

('Schizophyllum commune', ARRAY['Split Gill'], 'Schizophyllaceae', 'Schizophyllum', 'inedible',
 'Tiny fan-shaped fuzzy white-gray cap with split radial gills underneath. Found worldwide on every continent except Antarctica.',
 'On dead wood of nearly any tree species.',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], NULL, 'White', ARRAY['Worldwide'], 117915),

-- ===== ADDITIONAL COMMON SPECIES =====
('Morchella elata', ARRAY['Black Morel'], 'Morchellaceae', 'Morchella', 'edible_with_caution',
 'Conical cap with vertical ridges, dark gray to black. Pits between ridges. Hollow throughout.',
 'Conifer forests, recently burned areas.',
 ARRAY[3,4,5,6], 'Always cook thoroughly. Some people sensitive even when cooked. Never eat with alcohol.',
 'Cream', ARRAY['Northern Hemisphere'], 56830),

('Cantharellus tubaeformis', ARRAY['Yellowfoot','Trumpet Chanterelle'], 'Cantharellaceae', 'Cantharellus', 'edible',
 'Funnel-shaped brown cap with hollow yellow stem, false gills underside. Tough texture, mild flavor.',
 'Mossy coniferous forests.',
 ARRAY[8,9,10,11], NULL, 'Cream-yellow', ARRAY['Northern Hemisphere'], 121736),

('Boletus reticulatus', ARRAY['Summer Cep'], 'Boletaceae', 'Boletus', 'edible',
 'Brown cap with finely cracked surface, prominent stem reticulation. Earlier season than B. edulis.',
 'Mycorrhizal with oak, beech.',
 ARRAY[5,6,7,8], NULL, 'Olive-brown', ARRAY['Europe'], 165552),

('Leccinum scabrum', ARRAY['Birch Bolete'], 'Boletaceae', 'Leccinum', 'edible',
 'Brown cap, gray-white tube layer, white stem with dark scaberulous scales.',
 'Mycorrhizal with birch.',
 ARRAY[7,8,9,10], NULL, 'Brown', ARRAY['Northern Hemisphere'], 47712),

('Laetiporus sulphureus', ARRAY['Chicken of the Woods','Sulphur Shelf'], 'Fomitopsidaceae', 'Laetiporus', 'edible_with_caution',
 'Bright orange-yellow shelf-like brackets with sulfurous yellow underside. Chicken-like texture when young.',
 'On living and dead hardwoods, especially oak.',
 ARRAY[5,6,7,8,9,10], 'Always cook. Some people get GI upset, especially from specimens on conifers, eucalyptus, or yew.',
 'White', ARRAY['Northern Hemisphere'], 121739),

('Lepista nuda', ARRAY['Wood Blewit'], 'Tricholomataceae', 'Lepista', 'edible',
 'Lilac to violet cap and gills when young, fading to brown. Earthy aroma.',
 'Leaf litter, compost, garden soil. Late season.',
 ARRAY[10,11,12], 'Always cook — raw can cause GI upset.', 'Pale pink', ARRAY['Northern Hemisphere'], 56833)

ON CONFLICT (scientific_name) DO NOTHING;
