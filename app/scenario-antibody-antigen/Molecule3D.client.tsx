import { useEffect, useState } from "react";
import { Plugin } from "molstar/lib/mol-plugin-ui/plugin";
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginBehaviors } from "molstar/lib/mol-plugin/behavior";
import 'molstar/build/viewer/molstar.css';
import { PluginConfig } from "molstar/lib/mol-plugin/config";


async function loadFile(file: File, ctx: PluginUIContext) {
    const url = URL.createObjectURL(file);
    const data = await ctx.builders.data.download({ url, isBinary: false });
    const trajectory =
        await ctx.builders.structure.parseTrajectory(data, "pdb");
    const model = await ctx.builders.structure.createModel(trajectory);
    const structure = await ctx.builders.structure.createStructure(model);
    // TODO molecule is not rendered, when representation is change manually
    // it shows for example by changing quick styles in controls panel
    ctx.behaviors.canvas3d.initialized.subscribe(async v => {
        console.log('canvas3d initialized', v);
        await ctx.builders.structure.representation.applyPreset(structure, "default");
    });
}

export function Molecule3D({ file }: { file: File }) {
    const [plugin, setPlugin] = useState<PluginUIContext | null>(null);

    useEffect(() => {
        if (plugin !== null) {
            return;
        }
        const defaultSpec = DefaultPluginUISpec();
        const spec: PluginUISpec = {
            actions: defaultSpec.actions,
            behaviors: [
                PluginSpec.Behavior(PluginBehaviors.Representation.HighlightLoci, { mark: false }),
                PluginSpec.Behavior(PluginBehaviors.Representation.DefaultLociLabelProvider),
                PluginSpec.Behavior(PluginBehaviors.Camera.FocusLoci),

                PluginSpec.Behavior(PluginBehaviors.CustomProps.StructureInfo),
                PluginSpec.Behavior(PluginBehaviors.CustomProps.Interactions),
                PluginSpec.Behavior(PluginBehaviors.CustomProps.SecondaryStructure),
            ],
            customParamEditors: defaultSpec.customParamEditors,
            layout: {
                initial: {
                    isExpanded: false,
                    showControls: false,
                    controlsDisplay: 'outside',
                },
            },
            components: {
                ...defaultSpec.components,
                controls: {
                    ...defaultSpec.components?.controls,
                    top: undefined,
                    bottom: 'none',
                    left: 'none',
                },
                remoteState: 'none',
            },
            config: [
                [PluginConfig.Viewport.ShowExpand, false],
                [PluginConfig.Viewport.ShowControls, true],
                [PluginConfig.Viewport.ShowSettings, true],                
                [PluginConfig.Viewport.ShowSelectionMode, true],
            ]
        };

        const ctx = new PluginUIContext(spec);
        async function init() {
            await ctx.init();
            setPlugin(ctx);
        }
        init()
        return () => {
            if (ctx) {
                ctx.dispose();
            }
        }
    }, [])
    
    useEffect(() => {
        async function init() {
            if (plugin === null) {
                return;
            }
            await loadFile(file, plugin);
        }
        init();
        return () => {
            if (plugin === null) {
                return;
            }
            plugin.managers.structure.hierarchy.updateCurrent(plugin.managers.structure.hierarchy.current.structures, 'remove');
        }
    }, [file, plugin])

    if (plugin === null) {
        return <div className="relative w-[800px] h-[400px]">Loading...</div>
    }
    return (
        <div className="relative w-[800px] h-[400px]">
            <Plugin plugin={plugin} />
        </div>
    );
}