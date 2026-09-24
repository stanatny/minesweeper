(()=>{var g_=Object.defineProperty;var __=(s,e)=>{for(var t in e)g_(s,t,{get:e[t],enumerable:!0})};var pr=class{constructor({width:e=9,height:t=9,mines:i=10,random:n=Math.random,topology:r=null}={}){if(this.topology=r===null?null:x_(r),this.topology){e=this.topology.width,t=this.topology.height,this.#t=this.topology.cells.map(l=>l.neighbors);let a=Math.max(...this.#t.map(l=>l.length)),o=this.topology.cellCount-a-1;if(!Number.isInteger(i)||i<1||i>o)throw new RangeError(`Mines must be an integer between 1 and ${o}`)}else{if(!Number.isInteger(e)||e<5||e>50)throw new RangeError("Width must be an integer between 5 and 50");if(!Number.isInteger(t)||t<5||t>30)throw new RangeError("Height must be an integer between 5 and 30");if(!Number.isInteger(i)||i<1||i>e*t-9)throw new RangeError("Mines must be an integer between 1 and width * height - 9")}if(typeof n!="function")throw new TypeError("Random must be a function");this.width=e,this.height=t,this.mines=i,this.status="ready",this.revealedCount=0,this.flagCount=0,this.#n=n,this.cells=Array.from({length:e*t},(a,o)=>({id:o,x:this.topology?this.topology.cells[o].x:o%e,y:this.topology?this.topology.cells[o].y:Math.floor(o/e),...this.topology?{face:this.topology.cells[o].face,u:this.topology.cells[o].u,v:this.topology.cells[o].v}:{},mine:!1,revealed:!1,flagged:!1,adjacent:0,exploded:!1,wrongFlag:!1}))}reveal(e){if(!this.#i(e))return this.#e();let t=this.cells[e];if(t.revealed||t.flagged)return this.#e();this.status==="ready"&&(this.#l(e),this.status="playing");let i=new Set;if(t.mine)return this.#a(e,i),this.#e(i,"lose");this.#r(e,i);let n=this.#o(i)?"win":"reveal";return this.#e(i,n)}toggleFlag(e){if(!this.#i(e)||this.status!=="playing")return this.#e();let t=this.cells[e];return t.revealed?this.#e():(t.flagged=!t.flagged,this.flagCount+=t.flagged?1:-1,this.#e(new Set([e]),t.flagged?"flag":"unflag"))}chord(e){if(!this.#i(e)||this.status!=="playing")return this.#e();let t=this.cells[e];if(!t.revealed||t.adjacent===0)return this.#e();let i=this.neighbors(e);if(i.filter(o=>this.cells[o].flagged).length!==t.adjacent)return this.#e();let r=new Set;for(let o of i){let l=this.cells[o];if(!(l.revealed||l.flagged)){if(l.mine)return this.#a(o,r),this.#e(r,"lose");this.#r(o,r)}}let a=this.#o(r)?"win":"chord";return this.#e(r,a)}neighbors(e){if(!this.#s(e))return[];if(this.#t)return[...this.#t[e]];let{x:t,y:i}=this.cells[e],n=[];for(let r=-1;r<=1;r+=1)for(let a=-1;a<=1;a+=1){if(a===0&&r===0)continue;let o=t+a,l=i+r;o<0||l<0||o>=this.width||l>=this.height||n.push(l*this.width+o)}return n}snapshot(){return{width:this.width,height:this.height,mines:this.mines,status:this.status,revealedCount:this.revealedCount,flagCount:this.flagCount,topology:this.topology,cells:this.cells.map(e=>({...e,mine:e.revealed?e.mine:null,adjacent:e.revealed?e.adjacent:null}))}}#n;#t=null;#s(e){return Number.isInteger(e)&&e>=0&&e<this.cells.length}#i(e){return this.#s(e)&&(this.status==="ready"||this.status==="playing")}#e(e=new Set,t="noop"){return{changed:[...e],outcome:this.status,action:e.size>0?t:"noop"}}#l(e){let t=new Set([e,...this.neighbors(e)]),i=this.cells.filter(n=>!t.has(n.id)).map(n=>n.id);for(let n=i.length-1;n>0;n-=1){let r=this.#n();if(!Number.isFinite(r)||r<0||r>=1)throw new RangeError("Random must return a finite number in [0, 1)");let a=Math.floor(r*(n+1));[i[n],i[a]]=[i[a],i[n]]}for(let n of i.slice(0,this.mines))this.cells[n].mine=!0;for(let n of this.cells)n.mine||(n.adjacent=this.neighbors(n.id).filter(r=>this.cells[r].mine).length)}#r(e,t){let i=[e],n=new Set(i);for(let r=0;r<i.length;r+=1){let a=this.cells[i[r]];if(!(a.revealed||a.flagged||a.mine)&&(a.revealed=!0,this.revealedCount+=1,t.add(a.id),a.adjacent===0))for(let o of this.neighbors(a.id)){let l=this.cells[o];l.revealed||l.flagged||l.mine||n.has(o)||(i.push(o),n.add(o))}}}#a(e,t){this.status="lost",this.cells[e].exploded=!0;for(let i of this.cells)i.mine?(i.revealed=!0,t.add(i.id)):i.flagged&&(i.wrongFlag=!0,t.add(i.id))}#o(e){if(this.revealedCount!==this.cells.length-this.mines)return!1;this.status="won";for(let t of this.cells)t.mine&&!t.flagged&&(t.flagged=!0,this.flagCount+=1,e.add(t.id));return!0}};function x_(s){if(!s||s.kind!=="surface"||!Array.isArray(s.cells)||!Number.isInteger(s.width)||s.width<1||!Number.isInteger(s.height)||s.height<1||s.cells.length!==s.width*s.height||s.cellCount!==s.cells.length)throw new TypeError("Topology must contain a valid surface cell map");let e=s.cells.map((r,a)=>{if(!r||r.id!==a||!Number.isInteger(r.x)||!Number.isInteger(r.y)||r.x<0||r.x>=s.width||r.y<0||r.y>=s.height||!Array.isArray(r.neighbors)||r.neighbors.length===0||new Set(r.neighbors).size!==r.neighbors.length||r.neighbors.some(l=>!Number.isInteger(l)||l<0||l>=s.cells.length||l===a))throw new TypeError("Topology cells must have sequential IDs and valid unique neighbors");let o={id:a,x:r.x,y:r.y,neighbors:[...r.neighbors]};for(let l of["face","u","v","patchSize"])if(r[l]!==void 0){if(!Number.isInteger(r[l])||r[l]<0)throw new TypeError("Topology coordinates and patch sizes must be nonnegative integers");o[l]=r[l]}for(let l of["center","normal"])r[l]!==void 0&&(o[l]=ad(r[l]));for(let l of["corners","patch"])if(r[l]!==void 0){if(!Array.isArray(r[l]))throw new TypeError("Topology geometry must contain arrays of finite vectors");o[l]=r[l].map(ad)}return o});for(let r of e)for(let a of r.neighbors)if(!e[a].neighbors.includes(r.id))throw new TypeError("Topology neighbors must be symmetric");let t=new Set([0]),i=[0];for(let r=0;r<i.length;r+=1)for(let a of e[i[r]].neighbors)t.has(a)||(t.add(a),i.push(a));if(t.size!==e.length)throw new TypeError("Topology must form one connected surface");let n={kind:"surface",width:s.width,height:s.height,cellCount:e.length,cells:e};for(let r of["resolution","seed","irregularity","radius","surfaceArea","patchSize","maxDegree"])if(s[r]!==void 0){if(!Number.isFinite(s[r]))throw new TypeError("Topology metadata must contain finite numbers");n[r]=s[r]}return typeof s.shape=="string"&&(n.shape=s.shape),s.viewDirection!==void 0&&(n.viewDirection=ad(s.viewDirection)),Up(n)}function ad(s){if(!Array.isArray(s)||s.length!==3||!s.every(Number.isFinite))throw new TypeError("Topology positions and normals must be finite 3D vectors");return[...s]}function Up(s){if(s&&typeof s=="object"&&!Object.isFrozen(s)){for(let e of Object.values(s))Up(e);Object.freeze(s)}return s}var fs={};__(fs,{ACESFilmicToneMapping:()=>us,AddEquation:()=>hs,AddOperation:()=>Tf,AdditiveAnimationBlendMode:()=>Au,AdditiveBlending:()=>zn,AgXToneMapping:()=>ba,AlphaFormat:()=>Tu,AlwaysCompare:()=>Bf,AlwaysDepth:()=>po,AlwaysStencilFunc:()=>Df,AmbientLight:()=>js,AnimationAction:()=>xl,AnimationClip:()=>ls,AnimationLoader:()=>Ih,AnimationMixer:()=>Wh,AnimationObjectGroup:()=>Hh,AnimationUtils:()=>Ph,ArcCurve:()=>Oo,ArrayCamera:()=>ml,ArrowHelper:()=>uu,AttachedBindMode:()=>hh,Audio:()=>gl,AudioAnalyser:()=>Gh,AudioContext:()=>fa,AudioListener:()=>kh,AudioLoader:()=>Bh,AxesHelper:()=>du,BackSide:()=>oi,BasicDepthPacking:()=>Pf,BasicShadowMap:()=>Zm,BatchedMesh:()=>Co,BezierInterpolant:()=>al,Bone:()=>Zr,BooleanKeyframeTrack:()=>_n,Box2:()=>vl,Box3:()=>Wt,Box3Helper:()=>cu,BoxGeometry:()=>jt,BoxHelper:()=>lu,BufferAttribute:()=>ft,BufferGeometry:()=>Ye,BufferGeometryLoader:()=>fl,ByteType:()=>Mu,Cache:()=>en,Camera:()=>Js,CameraHelper:()=>ou,CanvasTexture:()=>mn,CapsuleGeometry:()=>Lo,CatmullRomCurve3:()=>Bo,CineonToneMapping:()=>ya,CircleGeometry:()=>No,ClampToEdgeWrapping:()=>di,Clock:()=>Jh,Color:()=>ae,ColorKeyframeTrack:()=>la,ColorManagement:()=>nt,Compatibility:()=>Ug,CompressedArrayTexture:()=>Eh,CompressedCubeTexture:()=>Ah,CompressedTexture:()=>Vs,CompressedTextureLoader:()=>Dh,ConeGeometry:()=>$r,ConstantAlphaFactor:()=>bf,ConstantColorFactor:()=>yf,Controls:()=>ma,CubeCamera:()=>pl,CubeDepthTexture:()=>Do,CubeReflectionMapping:()=>on,CubeRefractionMapping:()=>kn,CubeTexture:()=>ss,CubeTextureLoader:()=>Lh,CubeUVReflectionMapping:()=>nr,CubicBezierCurve:()=>jr,CubicBezierCurve3:()=>zo,CubicInterpolant:()=>sl,CullFaceBack:()=>mu,CullFaceFront:()=>sf,CullFaceFrontBack:()=>Ym,CullFaceNone:()=>nf,Curve:()=>Mi,CurvePath:()=>Vo,CustomBlending:()=>af,CustomToneMapping:()=>Ma,CylinderGeometry:()=>Bi,Cylindrical:()=>$h,Data3DTexture:()=>Us,DataArrayTexture:()=>Ns,DataTexture:()=>fi,DataTextureLoader:()=>Nh,DataUtils:()=>mh,DecrementStencilOp:()=>fg,DecrementWrapStencilOp:()=>mg,DefaultLoadingManager:()=>Hf,DepthFormat:()=>tn,DepthStencilFormat:()=>Vn,DepthTexture:()=>Un,DetachedBindMode:()=>Ef,DirectionalLight:()=>vn,DirectionalLightHelper:()=>au,DiscreteInterpolant:()=>rl,DodecahedronGeometry:()=>Uo,DoubleSide:()=>mi,DstAlphaFactor:()=>mf,DstColorFactor:()=>_f,DynamicCopyUsage:()=>Rg,DynamicDrawUsage:()=>ds,DynamicReadUsage:()=>Eg,EdgesGeometry:()=>Fo,EllipseCurve:()=>Gs,EqualCompare:()=>Uf,EqualDepth:()=>go,EqualStencilFunc:()=>vg,EquirectangularReflectionMapping:()=>wa,EquirectangularRefractionMapping:()=>Ta,Euler:()=>Oi,EventDispatcher:()=>ai,ExternalTexture:()=>Jr,ExtrudeGeometry:()=>Ws,FileLoader:()=>Vi,Float16BufferAttribute:()=>Mh,Float32BufferAttribute:()=>Te,FloatType:()=>si,Fog:()=>So,FogExp2:()=>bo,FramebufferTexture:()=>Th,FrontSide:()=>Bn,Frustum:()=>pn,FrustumArray:()=>Ao,GLBufferAttribute:()=>Kh,GLSL1:()=>Ig,GLSL3:()=>Cu,GreaterCompare:()=>Ff,GreaterDepth:()=>xo,GreaterEqualCompare:()=>rc,GreaterEqualDepth:()=>_o,GreaterEqualStencilFunc:()=>Sg,GreaterStencilFunc:()=>Mg,GridHelper:()=>su,Group:()=>Ei,HTMLTexture:()=>Ch,HalfFloatType:()=>Jt,HemisphereLight:()=>Zs,HemisphereLightHelper:()=>nu,IcosahedronGeometry:()=>rs,ImageBitmapLoader:()=>Oh,ImageLoader:()=>cs,ImageUtils:()=>Mo,IncrementStencilOp:()=>dg,IncrementWrapStencilOp:()=>pg,InstancedBufferAttribute:()=>Nn,InstancedBufferGeometry:()=>dl,InstancedInterleavedBuffer:()=>Zh,InstancedMesh:()=>Nt,Int16BufferAttribute:()=>vh,Int32BufferAttribute:()=>yh,Int8BufferAttribute:()=>gh,IntType:()=>Ml,InterleavedBuffer:()=>zs,InterleavedBufferAttribute:()=>is,Interpolant:()=>On,InterpolateBezier:()=>uh,InterpolateDiscrete:()=>zr,InterpolateLinear:()=>yo,InterpolateSmooth:()=>ao,InterpolationSamplingMode:()=>Ng,InterpolationSamplingType:()=>Lg,InvertStencilOp:()=>gg,KeepStencilOp:()=>oo,KeyframeTrack:()=>pi,LOD:()=>wo,LatheGeometry:()=>Xo,Layers:()=>Fs,LessCompare:()=>Nf,LessDepth:()=>mo,LessEqualCompare:()=>sc,LessEqualDepth:()=>Ds,LessEqualStencilFunc:()=>yg,LessStencilFunc:()=>xg,Light:()=>an,LightProbe:()=>hl,LightShadow:()=>Ks,Line:()=>sn,Line3:()=>Qh,LineBasicMaterial:()=>Kt,LineCurve:()=>Qr,LineCurve3:()=>ko,LineDashedMaterial:()=>nl,LineLoop:()=>Ro,LineSegments:()=>Ci,LinearFilter:()=>Tt,LinearInterpolant:()=>oa,LinearMipMapLinearFilter:()=>Qm,LinearMipMapNearestFilter:()=>jm,LinearMipmapLinearFilter:()=>ln,LinearMipmapNearestFilter:()=>Ea,LinearSRGBColorSpace:()=>Vr,LinearToneMapping:()=>xa,LinearTransfer:()=>Gr,Loader:()=>Qt,LoaderUtils:()=>da,LoadingManager:()=>ha,LoopOnce:()=>Af,LoopPingPong:()=>Rf,LoopRepeat:()=>Cf,MOUSE:()=>Hi,Material:()=>Gt,MaterialBlending:()=>Km,MaterialLoader:()=>ul,MathUtils:()=>Na,Matrix2:()=>jh,Matrix3:()=>Je,Matrix4:()=>qe,MaxEquation:()=>hf,Mesh:()=>st,MeshBasicMaterial:()=>dt,MeshDepthMaterial:()=>ra,MeshDistanceMaterial:()=>aa,MeshLambertMaterial:()=>tl,MeshMatcapMaterial:()=>il,MeshNormalMaterial:()=>el,MeshPhongMaterial:()=>jo,MeshPhysicalMaterial:()=>$o,MeshStandardMaterial:()=>Ht,MeshToonMaterial:()=>Qo,MinEquation:()=>cf,MirroredRepeatWrapping:()=>Br,MixOperation:()=>wf,MultiplyBlending:()=>_u,MultiplyOperation:()=>_a,NearestFilter:()=>Dt,NearestMipMapLinearFilter:()=>$m,NearestMipMapNearestFilter:()=>Jm,NearestMipmapLinearFilter:()=>sr,NearestMipmapNearestFilter:()=>yu,NeutralToneMapping:()=>Sa,NeverCompare:()=>Lf,NeverDepth:()=>fo,NeverStencilFunc:()=>_g,NoBlending:()=>Pi,NoColorSpace:()=>Mn,NoNormalPacking:()=>og,NoToneMapping:()=>Xi,NormalAnimationBlendMode:()=>nc,NormalBlending:()=>ir,NormalGAPacking:()=>cg,NormalRGPacking:()=>lg,NotEqualCompare:()=>Of,NotEqualDepth:()=>vo,NotEqualStencilFunc:()=>bg,NumberKeyframeTrack:()=>qs,Object3D:()=>ct,ObjectLoader:()=>Fh,ObjectSpaceNormalMap:()=>If,OctahedronGeometry:()=>ki,OneFactor:()=>df,OneMinusConstantAlphaFactor:()=>Sf,OneMinusConstantColorFactor:()=>Mf,OneMinusDstAlphaFactor:()=>gf,OneMinusDstColorFactor:()=>xf,OneMinusSrcAlphaFactor:()=>vu,OneMinusSrcColorFactor:()=>pf,OrthographicCamera:()=>Gi,PCFShadowMap:()=>ga,PCFSoftShadowMap:()=>rf,PMREMGenerator:()=>hc,Path:()=>gn,PerspectiveCamera:()=>kt,Plane:()=>vi,PlaneGeometry:()=>Ri,PlaneHelper:()=>hu,PointLight:()=>$s,PointLightHelper:()=>iu,Points:()=>Po,PointsMaterial:()=>Kr,PolarGridHelper:()=>ru,PolyhedronGeometry:()=>Fn,PositionalAudio:()=>Vh,PropertyBinding:()=>_t,PropertyMixer:()=>_l,QuadraticBezierCurve:()=>ea,QuadraticBezierCurve3:()=>ta,Quaternion:()=>bt,QuaternionKeyframeTrack:()=>Ys,QuaternionLinearInterpolant:()=>ol,R11_EAC_Format:()=>Nl,RED_GREEN_RGTC2_Format:()=>La,RED_RGTC1_Format:()=>ec,REVISION:()=>tf,RG11_EAC_Format:()=>Da,RGBADepthPacking:()=>sg,RGBAFormat:()=>ri,RGBAIntegerFormat:()=>El,RGBA_ASTC_10x10_Format:()=>Zl,RGBA_ASTC_10x5_Format:()=>Xl,RGBA_ASTC_10x6_Format:()=>ql,RGBA_ASTC_10x8_Format:()=>Yl,RGBA_ASTC_12x10_Format:()=>Kl,RGBA_ASTC_12x12_Format:()=>Jl,RGBA_ASTC_4x4_Format:()=>Ol,RGBA_ASTC_5x4_Format:()=>Bl,RGBA_ASTC_5x5_Format:()=>zl,RGBA_ASTC_6x5_Format:()=>kl,RGBA_ASTC_6x6_Format:()=>Vl,RGBA_ASTC_8x5_Format:()=>Gl,RGBA_ASTC_8x6_Format:()=>Hl,RGBA_ASTC_8x8_Format:()=>Wl,RGBA_BPTC_Format:()=>$l,RGBA_ETC2_EAC_Format:()=>Ll,RGBA_PVRTC_2BPPV1_Format:()=>Pl,RGBA_PVRTC_4BPPV1_Format:()=>Rl,RGBA_S3TC_DXT1_Format:()=>Ra,RGBA_S3TC_DXT3_Format:()=>Pa,RGBA_S3TC_DXT5_Format:()=>Ia,RGBDepthPacking:()=>rg,RGBFormat:()=>Eu,RGBIntegerFormat:()=>eg,RGB_BPTC_SIGNED_Format:()=>jl,RGB_BPTC_UNSIGNED_Format:()=>Ql,RGB_ETC1_Format:()=>Il,RGB_ETC2_Format:()=>Dl,RGB_PVRTC_2BPPV1_Format:()=>Cl,RGB_PVRTC_4BPPV1_Format:()=>Al,RGB_S3TC_DXT1_Format:()=>Ca,RGDepthPacking:()=>ag,RGFormat:()=>Gn,RGIntegerFormat:()=>Tl,RawShaderMaterial:()=>os,Ray:()=>nn,Raycaster:()=>pa,RectAreaLight:()=>cl,RedFormat:()=>wl,RedIntegerFormat:()=>Aa,ReinhardToneMapping:()=>va,RenderObjectRefreshType:()=>Fg,RenderTarget:()=>Xr,RenderTarget3D:()=>Xh,RepeatWrapping:()=>Or,ReplaceStencilOp:()=>ug,ReverseSubtractEquation:()=>lf,RingGeometry:()=>as,SIGNED_R11_EAC_Format:()=>Ul,SIGNED_RED_GREEN_RGTC2_Format:()=>ic,SIGNED_RED_RGTC1_Format:()=>tc,SIGNED_RG11_EAC_Format:()=>Fl,SRGBColorSpace:()=>zt,SRGBTransfer:()=>ut,Scene:()=>Bs,ShaderChunk:()=>tt,ShaderLib:()=>cn,ShaderMaterial:()=>Rt,ShadowMaterial:()=>Jo,Shape:()=>zi,ShapeGeometry:()=>Xs,ShapePath:()=>fu,ShapeUtils:()=>Fi,ShortType:()=>bu,Skeleton:()=>Eo,SkeletonHelper:()=>tu,SkinnedMesh:()=>To,Source:()=>dh,Sphere:()=>Vt,SphereGeometry:()=>sa,Spherical:()=>er,SphericalHarmonics3:()=>ua,SplineCurve:()=>ia,SpotLight:()=>ll,SpotLightHelper:()=>eu,Sprite:()=>ks,SpriteMaterial:()=>ns,SrcAlphaFactor:()=>xu,SrcAlphaSaturateFactor:()=>vf,SrcColorFactor:()=>ff,StaticCopyUsage:()=>Cg,StaticDrawUsage:()=>ac,StaticReadUsage:()=>Tg,StereoCamera:()=>zh,StreamCopyUsage:()=>Pg,StreamDrawUsage:()=>wg,StreamReadUsage:()=>Ag,StringKeyframeTrack:()=>xn,SubtractEquation:()=>of,SubtractiveBlending:()=>gu,TOUCH:()=>Wi,TangentSpaceNormalMap:()=>yn,TetrahedronGeometry:()=>qo,Texture:()=>Lt,TextureLoader:()=>Uh,TextureSource:()=>Ui,TextureUtils:()=>pu,Timer:()=>Qs,TimestampQuery:()=>Dg,TorusGeometry:()=>rn,TorusKnotGeometry:()=>Yo,Triangle:()=>Qi,TriangleFanDrawMode:()=>ng,TriangleStripDrawMode:()=>ig,TrianglesDrawMode:()=>tg,TubeGeometry:()=>Zo,UVMapping:()=>yl,Uint16BufferAttribute:()=>qr,Uint32BufferAttribute:()=>Yr,Uint8BufferAttribute:()=>_h,Uint8ClampedBufferAttribute:()=>xh,Uniform:()=>qh,UniformsGroup:()=>Yh,UniformsLib:()=>Se,UniformsUtils:()=>bn,UnsignedByteType:()=>gi,UnsignedInt101111Type:()=>wu,UnsignedInt248Type:()=>ar,UnsignedInt5999Type:()=>Su,UnsignedIntType:()=>Ii,UnsignedShort4444Type:()=>bl,UnsignedShort5551Type:()=>Sl,UnsignedShortType:()=>rr,VSMShadowMap:()=>tr,Vector2:()=>Z,Vector3:()=>C,Vector4:()=>xt,VectorKeyframeTrack:()=>ca,VideoFrameTexture:()=>wh,VideoTexture:()=>Io,WebGL3DRenderTarget:()=>ph,WebGLArrayRenderTarget:()=>fh,WebGLCoordinateSystem:()=>yi,WebGLCubeRenderTarget:()=>uc,WebGLRenderTarget:()=>Ct,WebGLRenderer:()=>dc,WebGLUtils:()=>E0,WebGPUCoordinateSystem:()=>es,WebXRController:()=>Os,WireframeGeometry:()=>Ko,WrapAroundEnding:()=>kr,ZeroCurvatureEnding:()=>jn,ZeroFactor:()=>uf,ZeroSlopeEnding:()=>Qn,ZeroStencilOp:()=>hg,createCanvasElement:()=>zf,error:()=>Ue,getConsoleFunction:()=>zg,log:()=>Wr,setConsoleFunction:()=>Bg,warn:()=>_e,warnOnce:()=>fn});var tf="186",Hi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Wi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},nf=0,mu=1,sf=2,Ym=3,Zm=0,ga=1,rf=2,tr=3,Bn=0,oi=1,mi=2,Pi=0,ir=1,zn=2,gu=3,_u=4,af=5,Km=6,hs=100,of=101,lf=102,cf=103,hf=104,uf=200,df=201,ff=202,pf=203,xu=204,vu=205,mf=206,gf=207,_f=208,xf=209,vf=210,yf=211,Mf=212,bf=213,Sf=214,fo=0,po=1,mo=2,Ds=3,go=4,_o=5,xo=6,vo=7,_a=0,wf=1,Tf=2,Xi=0,xa=1,va=2,ya=3,us=4,Ma=5,ba=6,Sa=7,hh="attached",Ef="detached",yl=300,on=301,kn=302,wa=303,Ta=304,nr=306,Or=1e3,di=1001,Br=1002,Dt=1003,yu=1004,Jm=1004,sr=1005,$m=1005,Tt=1006,Ea=1007,jm=1007,ln=1008,Qm=1008,gi=1009,Mu=1010,bu=1011,rr=1012,Ml=1013,Ii=1014,si=1015,Jt=1016,bl=1017,Sl=1018,ar=1020,Su=35902,wu=35899,Tu=1021,Eu=1022,ri=1023,tn=1026,Vn=1027,wl=1028,Aa=1029,Gn=1030,Tl=1031,eg=1032,El=1033,Ca=33776,Ra=33777,Pa=33778,Ia=33779,Al=35840,Cl=35841,Rl=35842,Pl=35843,Il=36196,Dl=37492,Ll=37496,Nl=37488,Ul=37489,Da=37490,Fl=37491,Ol=37808,Bl=37809,zl=37810,kl=37811,Vl=37812,Gl=37813,Hl=37814,Wl=37815,Xl=37816,ql=37817,Yl=37818,Zl=37819,Kl=37820,Jl=37821,$l=36492,jl=36494,Ql=36495,ec=36283,tc=36284,La=36285,ic=36286,Af=2200,Cf=2201,Rf=2202,zr=2300,yo=2301,ao=2302,uh=2303,jn=2400,Qn=2401,kr=2402,nc=2500,Au=2501,tg=0,ig=1,ng=2,Pf=3200,sg=3201,rg=3202,ag=3203,yn=0,If=1,Mn="",zt="srgb",Vr="srgb-linear",Gr="linear",ut="srgb",og="",lg="rg",cg="ga",hg=0,oo=7680,ug=7681,dg=7682,fg=7683,pg=34055,mg=34056,gg=5386,_g=512,xg=513,vg=514,yg=515,Mg=516,bg=517,Sg=518,Df=519,Lf=512,Nf=513,Uf=514,sc=515,Ff=516,Of=517,rc=518,Bf=519,ac=35044,ds=35048,wg=35040,Tg=35045,Eg=35049,Ag=35041,Cg=35046,Rg=35050,Pg=35042,Ig="100",Cu="300 es",yi=2e3,es=2001,Dg={COMPUTE:"compute",RENDER:"render"},Lg={PERSPECTIVE:"perspective",LINEAR:"linear",FLAT:"flat"},Ng={NORMAL:"normal",CENTROID:"centroid",SAMPLE:"sample",FIRST:"first",EITHER:"either"},Ug={TEXTURE_COMPARE:"depthTextureCompare"},Fg={NONE:0,SHARED:1,FULL:2};function v_(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}var y_={Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array};function Ur(s,e){return new y_[s](e)}function Og(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Hr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function zf(){let s=Hr("canvas");return s.style.display="block",s}var Fp={},ts=null;function Bg(s){ts=s}function zg(){return ts}function Wr(...s){let e="THREE."+s.shift();ts?ts("log",e,...s):console.log(e,...s)}function kg(s){let e=s[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=s[1];t&&t.isStackTrace?s[0]+=" "+t.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function _e(...s){s=kg(s);let e="THREE."+s.shift();if(ts)ts("warn",e,...s);else{let t=s[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...s)}}function Ue(...s){s=kg(s);let e="THREE."+s.shift();if(ts)ts("error",e,...s);else{let t=s[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...s)}}function fn(...s){let e=s.join(" ");e in Fp||(Fp[e]=!0,_e(...s))}function Vg(s,e,t){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Gg={[fo]:po,[mo]:xo,[go]:vo,[Ds]:_o,[po]:fo,[xo]:mo,[vo]:go,[_o]:Ds},ai=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let n=i[e];if(n!==void 0){let r=n.indexOf(t);r!==-1&&n.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let n=i.slice(0);for(let r=0,a=n.length;r<a;r++)n[r].call(this,e);e.target=null}}},ti=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Op=1234567,Is=Math.PI/180,Ls=180/Math.PI;function Ai(){let s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(ti[s&255]+ti[s>>8&255]+ti[s>>16&255]+ti[s>>24&255]+"-"+ti[e&255]+ti[e>>8&255]+"-"+ti[e>>16&15|64]+ti[e>>24&255]+"-"+ti[t&63|128]+ti[t>>8&255]+"-"+ti[t>>16&255]+ti[t>>24&255]+ti[i&255]+ti[i>>8&255]+ti[i>>16&255]+ti[i>>24&255]).toLowerCase()}function Ze(s,e,t){return Math.max(e,Math.min(t,s))}function kf(s,e){return(s%e+e)%e}function M_(s,e,t,i,n){return i+(s-e)*(n-i)/(t-e)}function b_(s,e,t){return s!==e?(t-s)/(e-s):0}function lo(s,e,t){return(1-t)*s+t*e}function S_(s,e,t,i){return lo(s,e,1-Math.exp(-t*i))}function w_(s,e=1){return e-Math.abs(kf(s,e*2)-e)}function T_(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function E_(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function A_(s,e){return s+Math.floor(Math.random()*(e-s+1))}function C_(s,e){return s+Math.random()*(e-s)}function R_(s){return s*(.5-Math.random())}function P_(s){s!==void 0&&(Op=s);let e=Op+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function I_(s){return s*Is}function D_(s){return s*Ls}function L_(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function N_(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function U_(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function F_(s,e,t,i,n){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+i)/2),h=a((e+i)/2),d=r((e-i)/2),u=a((e-i)/2),f=r((i-e)/2),p=a((i-e)/2);switch(n){case"XYX":s.set(o*h,l*d,l*u,o*c);break;case"YZY":s.set(l*u,o*h,l*d,o*c);break;case"ZXZ":s.set(l*d,l*u,o*h,o*c);break;case"XZX":s.set(o*h,l*p,l*f,o*c);break;case"YXY":s.set(l*f,o*h,l*p,o*c);break;case"ZYZ":s.set(l*p,l*f,o*h,o*c);break;default:_e("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function ui(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function et(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Na={DEG2RAD:Is,RAD2DEG:Ls,generateUUID:Ai,clamp:Ze,euclideanModulo:kf,mapLinear:M_,inverseLerp:b_,lerp:lo,damp:S_,pingpong:w_,smoothstep:T_,smootherstep:E_,randInt:A_,randFloat:C_,randFloatSpread:R_,seededRandom:P_,degToRad:I_,radToDeg:D_,isPowerOfTwo:L_,ceilPowerOfTwo:N_,floorPowerOfTwo:U_,setQuaternionFromProperEuler:F_,normalize:et,denormalize:ui},Z=class s{static{s.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,n=e.elements;return this.x=n[0]*t+n[3]*i+n[6],this.y=n[1]*t+n[4]*i+n[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ze(this.x,e.x,t.x),this.y=Ze(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ze(this.x,e,t),this.y=Ze(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ze(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ze(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),n=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*n+e.x,this.y=r*n+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},bt=class{constructor(e=0,t=0,i=0,n=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=n}static slerpFlat(e,t,i,n,r,a,o){let l=i[n+0],c=i[n+1],h=i[n+2],d=i[n+3],u=r[a+0],f=r[a+1],p=r[a+2],_=r[a+3];if(d!==_||l!==u||c!==f||h!==p){let g=l*u+c*f+h*p+d*_;g<0&&(u=-u,f=-f,p=-p,_=-_,g=-g);let m=1-o;if(g<.9995){let y=Math.acos(g),w=Math.sin(y);m=Math.sin(m*y)/w,o=Math.sin(o*y)/w,l=l*m+u*o,c=c*m+f*o,h=h*m+p*o,d=d*m+_*o}else{l=l*m+u*o,c=c*m+f*o,h=h*m+p*o,d=d*m+_*o;let y=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=y,c*=y,h*=y,d*=y}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,n,r,a){let o=i[n],l=i[n+1],c=i[n+2],h=i[n+3],d=r[a],u=r[a+1],f=r[a+2],p=r[a+3];return e[t]=o*p+h*d+l*f-c*u,e[t+1]=l*p+h*u+c*d-o*f,e[t+2]=c*p+h*f+o*u-l*d,e[t+3]=h*p-o*d-l*u-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,n){return this._x=e,this._y=t,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,n=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(n/2),d=o(r/2),u=l(i/2),f=l(n/2),p=l(r/2);switch(a){case"XYZ":this._x=u*h*d+c*f*p,this._y=c*f*d-u*h*p,this._z=c*h*p+u*f*d,this._w=c*h*d-u*f*p;break;case"YXZ":this._x=u*h*d+c*f*p,this._y=c*f*d-u*h*p,this._z=c*h*p-u*f*d,this._w=c*h*d+u*f*p;break;case"ZXY":this._x=u*h*d-c*f*p,this._y=c*f*d+u*h*p,this._z=c*h*p+u*f*d,this._w=c*h*d-u*f*p;break;case"ZYX":this._x=u*h*d-c*f*p,this._y=c*f*d+u*h*p,this._z=c*h*p-u*f*d,this._w=c*h*d+u*f*p;break;case"YZX":this._x=u*h*d+c*f*p,this._y=c*f*d+u*h*p,this._z=c*h*p-u*f*d,this._w=c*h*d-u*f*p;break;case"XZY":this._x=u*h*d-c*f*p,this._y=c*f*d-u*h*p,this._z=c*h*p+u*f*d,this._w=c*h*d+u*f*p;break;default:_e("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,n=Math.sin(i);return this._x=e.x*n,this._y=e.y*n,this._z=e.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],n=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=i+o+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-n)*f}else if(i>o&&i>d){let f=2*Math.sqrt(1+i-o-d);this._w=(h-l)/f,this._x=.25*f,this._y=(n+a)/f,this._z=(r+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-i-d);this._w=(r-c)/f,this._x=(n+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+d-i-o);this._w=(a-n)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ze(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let n=Math.min(1,t/i);return this.slerp(e,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,n=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+a*o+n*c-r*l,this._y=n*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-n*o,this._w=a*h-i*o-n*l-r*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,n=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,n=-n,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+i*t,this._y=this._y*l+n*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+n*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(e),n*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},C=class s{static{s.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Bp.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Bp.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,n=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*n,this.y=r[1]*t+r[4]*i+r[7]*n,this.z=r[2]*t+r[5]*i+r[8]*n,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,n=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*n+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*n+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*n+r[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,n=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*n-o*i),h=2*(o*t-r*n),d=2*(r*i-a*t);return this.x=t+l*c+a*d-o*h,this.y=i+l*h+o*c-r*d,this.z=n+l*d+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,n=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*n,this.y=r[1]*t+r[5]*i+r[9]*n,this.z=r[2]*t+r[6]*i+r[10]*n,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ze(this.x,e.x,t.x),this.y=Ze(this.y,e.y,t.y),this.z=Ze(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ze(this.x,e,t),this.y=Ze(this.y,e,t),this.z=Ze(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ze(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,n=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=n*l-r*o,this.y=r*a-i*l,this.z=i*o-n*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return od.copy(this).projectOnVector(e),this.sub(od)}reflect(e){return this.sub(od.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ze(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,n=this.z-e.z;return t*t+i*i+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let n=Math.sin(t)*e;return this.x=n*Math.sin(i),this.y=Math.cos(t)*e,this.z=n*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),n=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=n,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},od=new C,Bp=new bt,Je=class s{static{s.prototype.isMatrix3=!0}constructor(e,t,i,n,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,n,r,a,o,l,c)}set(e,t,i,n,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=n,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,n=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],d=i[7],u=i[2],f=i[5],p=i[8],_=n[0],g=n[3],m=n[6],y=n[1],w=n[4],v=n[7],b=n[2],M=n[5],A=n[8];return r[0]=a*_+o*y+l*b,r[3]=a*g+o*w+l*M,r[6]=a*m+o*v+l*A,r[1]=c*_+h*y+d*b,r[4]=c*g+h*w+d*M,r[7]=c*m+h*v+d*A,r[2]=u*_+f*y+p*b,r[5]=u*g+f*w+p*M,r[8]=u*m+f*v+p*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],n=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-i*r*h+i*o*l+n*r*c-n*a*l}invert(){let e=this.elements,t=e[0],i=e[1],n=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,u=o*l-h*r,f=c*r-a*l,p=t*d+i*u+n*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/p;return e[0]=d*_,e[1]=(n*c-h*i)*_,e[2]=(o*i-n*a)*_,e[3]=u*_,e[4]=(h*t-n*l)*_,e[5]=(n*r-o*t)*_,e[6]=f*_,e[7]=(i*l-c*t)*_,e[8]=(a*t-i*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,n,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-n*c,n*l,-n*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return fn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ld.makeScale(e,t)),this}rotate(e){return fn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ld.makeRotation(-e)),this}translate(e,t){return fn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ld.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let n=0;n<9;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ld=new Je,zp=new Je().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),kp=new Je().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function O_(){let s={enabled:!0,workingColorSpace:Vr,spaces:{},convert:function(n,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ut&&(n.r=Ln(n.r),n.g=Ln(n.g),n.b=Ln(n.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ut&&(n.r=Fr(n.r),n.g=Fr(n.g),n.b=Fr(n.b))),n},workingToColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},colorSpaceToWorking:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===Mn?Gr:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,a){return n.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,r){return fn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(n,r)},toWorkingColorSpace:function(n,r){return fn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(n,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[Vr]:{primaries:e,whitePoint:i,transfer:Gr,toXYZ:zp,fromXYZ:kp,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:zt},outputColorSpaceConfig:{drawingBufferColorSpace:zt}},[zt]:{primaries:e,whitePoint:i,transfer:ut,toXYZ:zp,fromXYZ:kp,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:zt}}}),s}var nt=O_();function Ln(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Fr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var mr,Mo=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{mr===void 0&&(mr=Hr("canvas")),mr.width=e.width,mr.height=e.height;let n=mr.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),i=mr}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Hr("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let n=i.getImageData(0,0,e.width,e.height),r=n.data;for(let a=0;a<r.length;a++)r[a]=Ln(r[a]/255)*255;return i.putImageData(n,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Ln(t[i]/255)*255):t[i]=Ln(t[i]);return{data:t,width:e.width,height:e.height}}else return _e("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},B_=0,Ui=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:B_++}),this.uuid=Ai(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let a=0,o=n.length;a<o;a++)n[a].isDataTexture?r.push(cd(n[a].image)):r.push(cd(n[a]))}else r=cd(n);i.url=r}return t||(e.images[this.uuid]=i),i}};function cd(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Mo.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(_e("Texture: Unable to serialize Texture."),{})}var dh=class extends Ui{constructor(e=null){fn('Source: "Source" has been renamed to "TextureSource". Please update your code to use "THREE.TextureSource" instead.'),super(e),this.isSource=!0}},z_=0,hd=new C,Lt=class s extends ai{constructor(e=s.DEFAULT_IMAGE,t=s.DEFAULT_MAPPING,i=di,n=di,r=Tt,a=ln,o=ri,l=gi,c=s.DEFAULT_ANISOTROPY,h=Mn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:z_++}),this.uuid=Ai(),this.name="",this.source=new Ui(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Z(0,0),this.repeat=new Z(1,1),this.center=new Z(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(hd).x}get height(){return this.source.getSize(hd).y}get depth(){return this.source.getSize(hd).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){_e(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let n=this[t];if(n===void 0){_e(`Texture.setValues(): property '${t}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==yl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Or:e.x=e.x-Math.floor(e.x);break;case di:e.x=e.x<0?0:1;break;case Br:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Or:e.y=e.y-Math.floor(e.y);break;case di:e.y=e.y<0?0:1;break;case Br:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Lt.DEFAULT_IMAGE=null;Lt.DEFAULT_MAPPING=yl;Lt.DEFAULT_ANISOTROPY=1;var xt=class s{static{s.prototype.isVector4=!0}constructor(e=0,t=0,i=0,n=1){this.x=e,this.y=t,this.z=i,this.w=n}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,n){return this.x=e,this.y=t,this.z=i,this.w=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,n=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*n+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*n+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*n+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*n+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,n,r,l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],p=l[9],_=l[2],g=l[6],m=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-_)<.01&&Math.abs(p-g)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+_)<.1&&Math.abs(p+g)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(c+1)/2,v=(f+1)/2,b=(m+1)/2,M=(h+u)/4,A=(d+_)/4,x=(p+g)/4;return w>v&&w>b?w<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(w),n=M/i,r=A/i):v>b?v<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(v),i=M/n,r=x/n):b<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(b),i=A/r,n=x/r),this.set(i,n,r,t),this}let y=Math.sqrt((g-p)*(g-p)+(d-_)*(d-_)+(u-h)*(u-h));return Math.abs(y)<.001&&(y=1),this.x=(g-p)/y,this.y=(d-_)/y,this.z=(u-h)/y,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ze(this.x,e.x,t.x),this.y=Ze(this.y,e.y,t.y),this.z=Ze(this.z,e.z,t.z),this.w=Ze(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ze(this.x,e,t),this.y=Ze(this.y,e,t),this.z=Ze(this.z,e,t),this.w=Ze(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ze(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Xr=class extends ai{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t),this.textures=[];let n={width:e,height:t,depth:i.depth},r=new Lt(n),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Tt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=e,this.textures[n].image.height=t,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Ui(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ct=class extends Xr{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Ns=class extends Lt{constructor(e=null,t=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Dt,this.minFilter=Dt,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},fh=class extends Ct{constructor(e=1,t=1,i=1,n={}){super(e,t,n),this.isWebGLArrayRenderTarget=!0,this.depth=i,this.texture=new Ns(null,e,t,i),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}},Us=class extends Lt{constructor(e=null,t=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Dt,this.minFilter=Dt,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},ph=class extends Ct{constructor(e=1,t=1,i=1,n={}){super(e,t,n),this.isWebGL3DRenderTarget=!0,this.depth=i,this.texture=new Us(null,e,t,i),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}},qe=class s{static{s.prototype.isMatrix4=!0}constructor(e,t,i,n,r,a,o,l,c,h,d,u,f,p,_,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,n,r,a,o,l,c,h,d,u,f,p,_,g)}set(e,t,i,n,r,a,o,l,c,h,d,u,f,p,_,g){let m=this.elements;return m[0]=e,m[4]=t,m[8]=i,m[12]=n,m[1]=r,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=h,m[10]=d,m[14]=u,m[3]=f,m[7]=p,m[11]=_,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,n=1/gr.setFromMatrixColumn(e,0).length(),r=1/gr.setFromMatrixColumn(e,1).length(),a=1/gr.setFromMatrixColumn(e,2).length();return t[0]=i[0]*n,t[1]=i[1]*n,t[2]=i[2]*n,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,n=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let u=a*h,f=a*d,p=o*h,_=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=f+p*c,t[5]=u-_*c,t[9]=-o*l,t[2]=_-u*c,t[6]=p+f*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*h,f=l*d,p=c*h,_=c*d;t[0]=u+_*o,t[4]=p*o-f,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=f*o-p,t[6]=_+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*h,f=l*d,p=c*h,_=c*d;t[0]=u-_*o,t[4]=-a*d,t[8]=p+f*o,t[1]=f+p*o,t[5]=a*h,t[9]=_-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*h,f=a*d,p=o*h,_=o*d;t[0]=l*h,t[4]=p*c-f,t[8]=u*c+_,t[1]=l*d,t[5]=_*c+u,t[9]=f*c-p,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,f=a*c,p=o*l,_=o*c;t[0]=l*h,t[4]=_-u*d,t[8]=p*d+f,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=f*d+p,t[10]=u-_*d}else if(e.order==="XZY"){let u=a*l,f=a*c,p=o*l,_=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+_,t[5]=a*h,t[9]=f*d-p,t[2]=p*d-f,t[6]=o*h,t[10]=_*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(k_,e,V_)}lookAt(e,t,i){let n=this.elements;return wi.subVectors(e,t),wi.lengthSq()===0&&(wi.z=1),wi.normalize(),qn.crossVectors(i,wi),qn.lengthSq()===0&&(Math.abs(i.z)===1?wi.x+=1e-4:wi.z+=1e-4,wi.normalize(),qn.crossVectors(i,wi)),qn.normalize(),Mc.crossVectors(wi,qn),n[0]=qn.x,n[4]=Mc.x,n[8]=wi.x,n[1]=qn.y,n[5]=Mc.y,n[9]=wi.y,n[2]=qn.z,n[6]=Mc.z,n[10]=wi.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,n=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],d=i[5],u=i[9],f=i[13],p=i[2],_=i[6],g=i[10],m=i[14],y=i[3],w=i[7],v=i[11],b=i[15],M=n[0],A=n[4],x=n[8],T=n[12],R=n[1],I=n[5],U=n[9],O=n[13],D=n[2],B=n[6],X=n[10],k=n[14],ne=n[3],q=n[7],ee=n[11],$=n[15];return r[0]=a*M+o*R+l*D+c*ne,r[4]=a*A+o*I+l*B+c*q,r[8]=a*x+o*U+l*X+c*ee,r[12]=a*T+o*O+l*k+c*$,r[1]=h*M+d*R+u*D+f*ne,r[5]=h*A+d*I+u*B+f*q,r[9]=h*x+d*U+u*X+f*ee,r[13]=h*T+d*O+u*k+f*$,r[2]=p*M+_*R+g*D+m*ne,r[6]=p*A+_*I+g*B+m*q,r[10]=p*x+_*U+g*X+m*ee,r[14]=p*T+_*O+g*k+m*$,r[3]=y*M+w*R+v*D+b*ne,r[7]=y*A+w*I+v*B+b*q,r[11]=y*x+w*U+v*X+b*ee,r[15]=y*T+w*O+v*k+b*$,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],n=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],f=e[14],p=e[3],_=e[7],g=e[11],m=e[15],y=l*f-c*u,w=o*f-c*d,v=o*u-l*d,b=a*f-c*h,M=a*u-l*h,A=a*d-o*h;return t*(_*y-g*w+m*v)-i*(p*y-g*b+m*M)+n*(p*w-_*b+m*A)-r*(p*v-_*M+g*A)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],n=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-i*(r*h-o*l)+n*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let n=this.elements;return e.isVector3?(n[12]=e.x,n[13]=e.y,n[14]=e.z):(n[12]=e,n[13]=t,n[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],n=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],f=e[11],p=e[12],_=e[13],g=e[14],m=e[15],y=t*o-i*a,w=t*l-n*a,v=t*c-r*a,b=i*l-n*o,M=i*c-r*o,A=n*c-r*l,x=h*_-d*p,T=h*g-u*p,R=h*m-f*p,I=d*g-u*_,U=d*m-f*_,O=u*m-f*g,D=y*O-w*U+v*I+b*R-M*T+A*x;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/D;return e[0]=(o*O-l*U+c*I)*B,e[1]=(n*U-i*O-r*I)*B,e[2]=(_*A-g*M+m*b)*B,e[3]=(u*M-d*A-f*b)*B,e[4]=(l*R-a*O-c*T)*B,e[5]=(t*O-n*R+r*T)*B,e[6]=(g*v-p*A-m*w)*B,e[7]=(h*A-u*v+f*w)*B,e[8]=(a*U-o*R+c*x)*B,e[9]=(i*R-t*U-r*x)*B,e[10]=(p*M-_*v+m*y)*B,e[11]=(d*v-h*M-f*y)*B,e[12]=(o*T-a*I-l*x)*B,e[13]=(t*I-i*T+n*x)*B,e[14]=(_*w-p*b-g*y)*B,e[15]=(h*b-d*w+u*y)*B,this}scale(e){let t=this.elements,i=e.x,n=e.y,r=e.z;return t[0]*=i,t[4]*=n,t[8]*=r,t[1]*=i,t[5]*=n,t[9]*=r,t[2]*=i,t[6]*=n,t[10]*=r,t[3]*=i,t[7]*=n,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],n=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,n))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),n=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-n*l,c*l+n*o,0,c*o+n*l,h*o+i,h*l-n*a,0,c*l-n*o,h*l+n*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,n,r,a){return this.set(1,i,r,0,e,1,a,0,t,n,1,0,0,0,0,1),this}compose(e,t,i){let n=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,d=o+o,u=r*c,f=r*h,p=r*d,_=a*h,g=a*d,m=o*d,y=l*c,w=l*h,v=l*d,b=i.x,M=i.y,A=i.z;return n[0]=(1-(_+m))*b,n[1]=(f+v)*b,n[2]=(p-w)*b,n[3]=0,n[4]=(f-v)*M,n[5]=(1-(u+m))*M,n[6]=(g+y)*M,n[7]=0,n[8]=(p+w)*A,n[9]=(g-y)*A,n[10]=(1-(u+_))*A,n[11]=0,n[12]=e.x,n[13]=e.y,n[14]=e.z,n[15]=1,this}decompose(e,t,i){let n=this.elements;e.x=n[12],e.y=n[13],e.z=n[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=gr.set(n[0],n[1],n[2]).length(),o=gr.set(n[4],n[5],n[6]).length(),l=gr.set(n[8],n[9],n[10]).length();r<0&&(a=-a),Ki.copy(this);let c=1/a,h=1/o,d=1/l;return Ki.elements[0]*=c,Ki.elements[1]*=c,Ki.elements[2]*=c,Ki.elements[4]*=h,Ki.elements[5]*=h,Ki.elements[6]*=h,Ki.elements[8]*=d,Ki.elements[9]*=d,Ki.elements[10]*=d,t.setFromRotationMatrix(Ki),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,n,r,a,o=yi,l=!1){let c=this.elements,h=2*r/(t-e),d=2*r/(i-n),u=(t+e)/(t-e),f=(i+n)/(i-n),p,_;if(l)p=r/(a-r),_=a*r/(a-r);else if(o===yi)p=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===es)p=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,n,r,a,o=yi,l=!1){let c=this.elements,h=2/(t-e),d=2/(i-n),u=-(t+e)/(t-e),f=-(i+n)/(i-n),p,_;if(l)p=1/(a-r),_=a/(a-r);else if(o===yi)p=-2/(a-r),_=-(a+r)/(a-r);else if(o===es)p=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let n=0;n<16;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},gr=new C,Ki=new qe,k_=new C(0,0,0),V_=new C(1,1,1),qn=new C,Mc=new C,wi=new C,Vp=new qe,Gp=new bt,Oi=class s{constructor(e=0,t=0,i=0,n=s.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=n}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,n=this._order){return this._x=e,this._y=t,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let n=e.elements,r=n[0],a=n[4],o=n[8],l=n[1],c=n[5],h=n[9],d=n[2],u=n[6],f=n[10];switch(t){case"XYZ":this._y=Math.asin(Ze(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ze(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ze(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ze(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ze(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Ze(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:_e("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Vp.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Vp,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Gp.setFromEuler(this),this.setFromQuaternion(Gp,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Oi.DEFAULT_ORDER="XYZ";var Fs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},G_=0,Hp=new C,_r=new bt,En=new qe,bc=new C,qa=new C,H_=new C,W_=new bt,Wp=new C(1,0,0),Xp=new C(0,1,0),qp=new C(0,0,1),Yp={type:"added"},X_={type:"removed"},xr={type:"childadded",child:null},ud={type:"childremoved",child:null},ct=class s extends ai{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:G_++}),this.uuid=Ai(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let e=new C,t=new Oi,i=new bt,n=new C(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new qe},normalMatrix:{value:new Je}}),this.matrix=new qe,this.matrixWorld=new qe,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Fs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return _r.setFromAxisAngle(e,t),this.quaternion.multiply(_r),this}rotateOnWorldAxis(e,t){return _r.setFromAxisAngle(e,t),this.quaternion.premultiply(_r),this}rotateX(e){return this.rotateOnAxis(Wp,e)}rotateY(e){return this.rotateOnAxis(Xp,e)}rotateZ(e){return this.rotateOnAxis(qp,e)}translateOnAxis(e,t){return Hp.copy(e).applyQuaternion(this.quaternion),this.position.add(Hp.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Wp,e)}translateY(e){return this.translateOnAxis(Xp,e)}translateZ(e){return this.translateOnAxis(qp,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(En.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?bc.copy(e):bc.set(e,t,i);let n=this.parent;this.updateWorldMatrix(!0,!1),qa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?En.lookAt(qa,bc,this.up):En.lookAt(bc,qa,this.up),this.quaternion.setFromRotationMatrix(En),n&&(En.extractRotation(n.matrixWorld),_r.setFromRotationMatrix(En),this.quaternion.premultiply(_r.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ue("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Yp),xr.child=e,this.dispatchEvent(xr),xr.child=null):Ue("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(X_),ud.child=e,this.dispatchEvent(ud),ud.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),En.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),En.multiply(e.parent.matrixWorld)),e.applyMatrix4(En),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Yp),xr.child=e,this.dispatchEvent(xr),xr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,n=this.children.length;i<n;i++){let a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qa,e,H_),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qa,W_,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,n=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*n,r[13]+=i-r[1]*t-r[5]*i-r[9]*n,r[14]+=n-r[2]*t-r[6]*i-r[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(o=>({...o})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(e),n.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));n.material=o}else n.material=r(e.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];n.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),u=a(e.skeletons),f=a(e.animations),p=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),p.length>0&&(i.nodes=p)}return i.object=n,i;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let n=e.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};ct.DEFAULT_UP=new C(0,1,0);ct.DEFAULT_MATRIX_AUTO_UPDATE=!0;ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ei=class extends ct{constructor(){super(),this.isGroup=!0,this.type="Group"}},q_={type:"move"},Os=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ei,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ei,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ei,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let n=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let _ of e.hand.values()){let g=t.getJointPose(_,i),m=this._getHandJoint(c,_);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,p=.005;c.inputState.pinching&&u>f+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=f-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(n=t.getPose(e.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(q_)))}return o!==null&&(o.visible=n!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Ei;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Hg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Yn={h:0,s:0,l:0},Sc={h:0,s:0,l:0};function dd(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}var ae=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let n=e;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=zt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,n=nt.workingColorSpace){return this.r=e,this.g=t,this.b=i,nt.colorSpaceToWorking(this,n),this}setHSL(e,t,i,n=nt.workingColorSpace){if(e=kf(e,1),t=Ze(t,0,1),i=Ze(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=dd(a,r,e+1/3),this.g=dd(a,r,e),this.b=dd(a,r,e-1/3)}return nt.colorSpaceToWorking(this,n),this}setStyle(e,t=zt){function i(r){r!==void 0&&parseFloat(r)<1&&_e("Color: Alpha component of "+e+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=n[1],o=n[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:_e("Color: Unknown color model "+e)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=n[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);_e("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=zt){let i=Hg[e.toLowerCase()];return i!==void 0?this.setHex(i,t):_e("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ln(e.r),this.g=Ln(e.g),this.b=Ln(e.b),this}copyLinearToSRGB(e){return this.r=Fr(e.r),this.g=Fr(e.g),this.b=Fr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=zt){return nt.workingToColorSpace(ii.copy(this),e),Math.round(Ze(ii.r*255,0,255))*65536+Math.round(Ze(ii.g*255,0,255))*256+Math.round(Ze(ii.b*255,0,255))}getHexString(e=zt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=nt.workingColorSpace){nt.workingToColorSpace(ii.copy(this),t);let i=ii.r,n=ii.g,r=ii.b,a=Math.max(i,n,r),o=Math.min(i,n,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case i:l=(n-r)/d+(n<r?6:0);break;case n:l=(r-i)/d+2;break;case r:l=(i-n)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=nt.workingColorSpace){return nt.workingToColorSpace(ii.copy(this),t),e.r=ii.r,e.g=ii.g,e.b=ii.b,e}getStyle(e=zt){nt.workingToColorSpace(ii.copy(this),e);let t=ii.r,i=ii.g,n=ii.b;return e!==zt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(e,t,i){return this.getHSL(Yn),this.setHSL(Yn.h+e,Yn.s+t,Yn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Yn),e.getHSL(Sc);let i=lo(Yn.h,Sc.h,t),n=lo(Yn.s,Sc.s,t),r=lo(Yn.l,Sc.l,t);return this.setHSL(i,n,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,n=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*n,this.g=r[1]*t+r[4]*i+r[7]*n,this.b=r[2]*t+r[5]*i+r[8]*n,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},ii=new ae;ae.NAMES=Hg;var bo=class s{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new ae(e),this.density=t}clone(){return new s(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}},So=class s{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new ae(e),this.near=t,this.far=i}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Bs=class extends ct{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Oi,this.environmentIntensity=1,this.environmentRotation=new Oi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Ji=new C,An=new C,fd=new C,Cn=new C,vr=new C,yr=new C,Zp=new C,pd=new C,md=new C,gd=new C,_d=new xt,xd=new xt,vd=new xt,Qi=class s{constructor(e=new C,t=new C,i=new C){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,n){n.subVectors(i,t),Ji.subVectors(e,t),n.cross(Ji);let r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(e,t,i,n,r){Ji.subVectors(n,t),An.subVectors(i,t),fd.subVectors(e,t);let a=Ji.dot(Ji),o=Ji.dot(An),l=Ji.dot(fd),c=An.dot(An),h=An.dot(fd),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let u=1/d,f=(c*l-o*h)*u,p=(a*h-o*l)*u;return r.set(1-f-p,p,f)}static containsPoint(e,t,i,n){return this.getBarycoord(e,t,i,n,Cn)===null?!1:Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(e,t,i,n,r,a,o,l){return this.getBarycoord(e,t,i,n,Cn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Cn.x),l.addScaledVector(a,Cn.y),l.addScaledVector(o,Cn.z),l)}static getInterpolatedAttribute(e,t,i,n,r,a){return _d.setScalar(0),xd.setScalar(0),vd.setScalar(0),_d.fromBufferAttribute(e,t),xd.fromBufferAttribute(e,i),vd.fromBufferAttribute(e,n),a.setScalar(0),a.addScaledVector(_d,r.x),a.addScaledVector(xd,r.y),a.addScaledVector(vd,r.z),a}static isFrontFacing(e,t,i,n){return Ji.subVectors(i,t),An.subVectors(e,t),Ji.cross(An).dot(n)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,n){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[n]),this}setFromAttributeAndIndices(e,t,i,n){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ji.subVectors(this.c,this.b),An.subVectors(this.a,this.b),Ji.cross(An).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return s.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return s.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,n,r){return s.getInterpolation(e,this.a,this.b,this.c,t,i,n,r)}containsPoint(e){return s.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return s.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,n=this.b,r=this.c,a,o;vr.subVectors(n,i),yr.subVectors(r,i),pd.subVectors(e,i);let l=vr.dot(pd),c=yr.dot(pd);if(l<=0&&c<=0)return t.copy(i);md.subVectors(e,n);let h=vr.dot(md),d=yr.dot(md);if(h>=0&&d<=h)return t.copy(n);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(i).addScaledVector(vr,a);gd.subVectors(e,r);let f=vr.dot(gd),p=yr.dot(gd);if(p>=0&&f<=p)return t.copy(r);let _=f*c-l*p;if(_<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(i).addScaledVector(yr,o);let g=h*p-f*d;if(g<=0&&d-h>=0&&f-p>=0)return Zp.subVectors(r,n),o=(d-h)/(d-h+(f-p)),t.copy(n).addScaledVector(Zp,o);let m=1/(g+_+u);return a=_*m,o=u*m,t.copy(i).addScaledVector(vr,a).addScaledVector(yr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Wt=class{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint($i.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint($i.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=$i.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,$i):$i.fromBufferAttribute(r,a),$i.applyMatrix4(e.matrixWorld),this.expandByPoint($i);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),wc.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),wc.copy(i.boundingBox)),wc.applyMatrix4(e.matrixWorld),this.union(wc)}let n=e.children;for(let r=0,a=n.length;r<a;r++)this.expandByObject(n[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,$i),$i.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ya),Tc.subVectors(this.max,Ya),Mr.subVectors(e.a,Ya),br.subVectors(e.b,Ya),Sr.subVectors(e.c,Ya),Zn.subVectors(br,Mr),Kn.subVectors(Sr,br),vs.subVectors(Mr,Sr);let t=[0,-Zn.z,Zn.y,0,-Kn.z,Kn.y,0,-vs.z,vs.y,Zn.z,0,-Zn.x,Kn.z,0,-Kn.x,vs.z,0,-vs.x,-Zn.y,Zn.x,0,-Kn.y,Kn.x,0,-vs.y,vs.x,0];return!yd(t,Mr,br,Sr,Tc)||(t=[1,0,0,0,1,0,0,0,1],!yd(t,Mr,br,Sr,Tc))?!1:(Ec.crossVectors(Zn,Kn),t=[Ec.x,Ec.y,Ec.z],yd(t,Mr,br,Sr,Tc))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,$i).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize($i).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Rn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Rn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Rn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Rn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Rn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Rn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Rn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Rn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Rn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Rn=[new C,new C,new C,new C,new C,new C,new C,new C],$i=new C,wc=new Wt,Mr=new C,br=new C,Sr=new C,Zn=new C,Kn=new C,vs=new C,Ya=new C,Tc=new C,Ec=new C,ys=new C;function yd(s,e,t,i,n){for(let r=0,a=s.length-3;r<=a;r+=3){ys.fromArray(s,r);let o=n.x*Math.abs(ys.x)+n.y*Math.abs(ys.y)+n.z*Math.abs(ys.z),l=e.dot(ys),c=t.dot(ys),h=i.dot(ys);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Dn=Y_();function Y_(){let s=new ArrayBuffer(4),e=new Float32Array(s),t=new Uint32Array(s),i=new Uint32Array(512),n=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(i[l]=0,i[l|256]=32768,n[l]=24,n[l|256]=24):c<-14?(i[l]=1024>>-c-14,i[l|256]=1024>>-c-14|32768,n[l]=-c-1,n[l|256]=-c-1):c<=15?(i[l]=c+15<<10,i[l|256]=c+15<<10|32768,n[l]=13,n[l|256]=13):c<128?(i[l]=31744,i[l|256]=64512,n[l]=24,n[l|256]=24):(i[l]=31744,i[l|256]=64512,n[l]=13,n[l|256]=13)}let r=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;(c&8388608)===0;)c<<=1,h-=8388608;c&=-8388609,h+=947912704,r[l]=c|h}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:e,uint32View:t,baseTable:i,shiftTable:n,mantissaTable:r,exponentTable:a,offsetTable:o}}function xi(s){Math.abs(s)>65504&&_e("DataUtils.toHalfFloat(): Value out of range."),s=Ze(s,-65504,65504),Dn.floatView[0]=s;let e=Dn.uint32View[0],t=e>>23&511;return Dn.baseTable[t]+((e&8388607)>>Dn.shiftTable[t])}function so(s){let e=s>>10;return Dn.uint32View[0]=Dn.mantissaTable[Dn.offsetTable[e]+(s&1023)]+Dn.exponentTable[e],Dn.floatView[0]}var mh=class{static toHalfFloat(e){return xi(e)}static fromHalfFloat(e){return so(e)}},Bt=new C,Ac=new Z,Z_=0,ft=class extends ai{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Z_++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=ac,this.updateRanges=[],this.gpuType=si,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[e+n]=t.array[i+n];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Ac.fromBufferAttribute(this,t),Ac.applyMatrix3(e),this.setXY(t,Ac.x,Ac.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Bt.fromBufferAttribute(this,t),Bt.applyMatrix3(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Bt.fromBufferAttribute(this,t),Bt.applyMatrix4(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Bt.fromBufferAttribute(this,t),Bt.applyNormalMatrix(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Bt.fromBufferAttribute(this,t),Bt.transformDirection(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=ui(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=et(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ui(t,this.array)),t}setX(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ui(t,this.array)),t}setY(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ui(t,this.array)),t}setZ(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ui(t,this.array)),t}setW(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this}setXYZW(e,t,i,n,r){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array),r=et(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}},gh=class extends ft{constructor(e,t,i){super(new Int8Array(e),t,i)}},_h=class extends ft{constructor(e,t,i){super(new Uint8Array(e),t,i)}},xh=class extends ft{constructor(e,t,i){super(new Uint8ClampedArray(e),t,i)}},vh=class extends ft{constructor(e,t,i){super(new Int16Array(e),t,i)}},qr=class extends ft{constructor(e,t,i){super(new Uint16Array(e),t,i)}},yh=class extends ft{constructor(e,t,i){super(new Int32Array(e),t,i)}},Yr=class extends ft{constructor(e,t,i){super(new Uint32Array(e),t,i)}},Mh=class extends ft{constructor(e,t,i){super(new Uint16Array(e),t,i),this.isFloat16BufferAttribute=!0}getX(e){let t=so(this.array[e*this.itemSize]);return this.normalized&&(t=ui(t,this.array)),t}setX(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize]=xi(t),this}getY(e){let t=so(this.array[e*this.itemSize+1]);return this.normalized&&(t=ui(t,this.array)),t}setY(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+1]=xi(t),this}getZ(e){let t=so(this.array[e*this.itemSize+2]);return this.normalized&&(t=ui(t,this.array)),t}setZ(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+2]=xi(t),this}getW(e){let t=so(this.array[e*this.itemSize+3]);return this.normalized&&(t=ui(t,this.array)),t}setW(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+3]=xi(t),this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array)),this.array[e+0]=xi(t),this.array[e+1]=xi(i),this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array)),this.array[e+0]=xi(t),this.array[e+1]=xi(i),this.array[e+2]=xi(n),this}setXYZW(e,t,i,n,r){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array),r=et(r,this.array)),this.array[e+0]=xi(t),this.array[e+1]=xi(i),this.array[e+2]=xi(n),this.array[e+3]=xi(r),this}},Te=class extends ft{constructor(e,t,i){super(new Float32Array(e),t,i)}},K_=new Wt,Za=new C,Md=new C,Vt=class{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):K_.setFromPoints(e).getCenter(i);let n=0;for(let r=0,a=e.length;r<a;r++)n=Math.max(n,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(n),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Za.subVectors(e,this.center);let t=Za.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),n=(i-this.radius)*.5;this.center.addScaledVector(Za,n/i),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Md.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Za.copy(e.center).add(Md)),this.expandByPoint(Za.copy(e.center).sub(Md))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},J_=0,Ni=new qe,bd=new ct,wr=new C,Ti=new Wt,Ka=new Wt,Zt=new C,Ye=class s extends ai{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:J_++}),this.uuid=Ai(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(v_(e)?Yr:qr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Je().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Ni.makeRotationFromQuaternion(e),this.applyMatrix4(Ni),this}rotateX(e){return Ni.makeRotationX(e),this.applyMatrix4(Ni),this}rotateY(e){return Ni.makeRotationY(e),this.applyMatrix4(Ni),this}rotateZ(e){return Ni.makeRotationZ(e),this.applyMatrix4(Ni),this}translate(e,t,i){return Ni.makeTranslation(e,t,i),this.applyMatrix4(Ni),this}scale(e,t,i){return Ni.makeScale(e,t,i),this.applyMatrix4(Ni),this}lookAt(e){return bd.lookAt(e),bd.updateMatrix(),this.applyMatrix4(bd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wr).negate(),this.translate(wr.x,wr.y,wr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let n=0,r=e.length;n<r;n++){let a=e[n];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Te(i,3))}else{let i=Math.min(e.length,t.count);for(let n=0;n<i;n++){let r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&_e("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ue("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,n=t.length;i<n;i++){let r=t[i];Ti.setFromBufferAttribute(r),this.morphTargetsRelative?(Zt.addVectors(this.boundingBox.min,Ti.min),this.boundingBox.expandByPoint(Zt),Zt.addVectors(this.boundingBox.max,Ti.max),this.boundingBox.expandByPoint(Zt)):(this.boundingBox.expandByPoint(Ti.min),this.boundingBox.expandByPoint(Ti.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ue('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ue("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){let i=this.boundingSphere.center;if(Ti.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Ka.setFromBufferAttribute(o),this.morphTargetsRelative?(Zt.addVectors(Ti.min,Ka.min),Ti.expandByPoint(Zt),Zt.addVectors(Ti.max,Ka.max),Ti.expandByPoint(Zt)):(Ti.expandByPoint(Ka.min),Ti.expandByPoint(Ka.max))}Ti.getCenter(i);let n=0;for(let r=0,a=e.count;r<a;r++)Zt.fromBufferAttribute(e,r),n=Math.max(n,i.distanceToSquared(Zt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Zt.fromBufferAttribute(o,c),l&&(wr.fromBufferAttribute(e,c),Zt.add(wr)),n=Math.max(n,i.distanceToSquared(Zt))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&Ue('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ue("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,n=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new ft(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let x=0;x<i.count;x++)o[x]=new C,l[x]=new C;let c=new C,h=new C,d=new C,u=new Z,f=new Z,p=new Z,_=new C,g=new C;function m(x,T,R){c.fromBufferAttribute(i,x),h.fromBufferAttribute(i,T),d.fromBufferAttribute(i,R),u.fromBufferAttribute(r,x),f.fromBufferAttribute(r,T),p.fromBufferAttribute(r,R),h.sub(c),d.sub(c),f.sub(u),p.sub(u);let I=1/(f.x*p.y-p.x*f.y);isFinite(I)&&(_.copy(h).multiplyScalar(p.y).addScaledVector(d,-f.y).multiplyScalar(I),g.copy(d).multiplyScalar(f.x).addScaledVector(h,-p.x).multiplyScalar(I),o[x].add(_),o[T].add(_),o[R].add(_),l[x].add(g),l[T].add(g),l[R].add(g))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let x=0,T=y.length;x<T;++x){let R=y[x],I=R.start,U=R.count;for(let O=I,D=I+U;O<D;O+=3)m(e.getX(O+0),e.getX(O+1),e.getX(O+2))}let w=new C,v=new C,b=new C,M=new C;function A(x){b.fromBufferAttribute(n,x),M.copy(b);let T=o[x];w.copy(T),w.sub(b.multiplyScalar(b.dot(T))).normalize(),v.crossVectors(M,T);let I=v.dot(l[x])<0?-1:1;a.setXYZW(x,w.x,w.y,w.z,I)}for(let x=0,T=y.length;x<T;++x){let R=y[x],I=R.start,U=R.count;for(let O=I,D=I+U;O<D;O+=3)A(e.getX(O+0)),A(e.getX(O+1)),A(e.getX(O+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new ft(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);let n=new C,r=new C,a=new C,o=new C,l=new C,c=new C,h=new C,d=new C;if(e)for(let u=0,f=e.count;u<f;u+=3){let p=e.getX(u+0),_=e.getX(u+1),g=e.getX(u+2);n.fromBufferAttribute(t,p),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,g),h.subVectors(a,r),d.subVectors(n,r),h.cross(d),o.fromBufferAttribute(i,p),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,g),o.add(h),l.add(h),c.add(h),i.setXYZ(p,o.x,o.y,o.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,f=t.count;u<f;u+=3)n.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,r),d.subVectors(n,r),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Zt.fromBufferAttribute(e,t),Zt.normalize(),e.setXYZ(t,Zt.x,Zt.y,Zt.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),f=0,p=0;for(let _=0,g=l.length;_<g;_++){o.isInterleavedBufferAttribute?f=l[_]*o.data.stride+o.offset:f=l[_]*h;for(let m=0;m<h;m++)u[p++]=c[f++]}return new ft(u,h,d)}if(this.index===null)return _e("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new s,i=this.index.array,n=this.attributes;for(let o in n){let l=n[o],c=e(l,i);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],f=e(u,i);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let n={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d];h.push(f.toJSON(e.data))}h.length>0&&(n[l]=h,r=!0)}r&&(e.data.morphAttributes=n,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let n=e.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},zs=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ac,this.updateRanges=[],this.version=0,this.uuid=Ai()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let n=0,r=this.stride;n<r;n++)this.array[e+n]=t.array[i+n];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ai()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ai()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},hi=new C,is=class s{constructor(e,t,i,n=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=n}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)hi.fromBufferAttribute(this,t),hi.applyMatrix4(e),this.setXYZ(t,hi.x,hi.y,hi.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)hi.fromBufferAttribute(this,t),hi.applyNormalMatrix(e),this.setXYZ(t,hi.x,hi.y,hi.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)hi.fromBufferAttribute(this,t),hi.transformDirection(e),this.setXYZ(t,hi.x,hi.y,hi.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=ui(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=et(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ui(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ui(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ui(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ui(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=et(t,this.array),i=et(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=n,this}setXYZW(e,t,i,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array),r=et(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=n,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Wr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[n+r])}return new ft(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new s(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Wr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[n+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Sd=new C,$_=new C,j_=new Je,vi=class{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,n){return this.normal.set(e,t,i),this.constant=n,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let n=Sd.subVectors(i,t).cross($_.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(n,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let n=e.delta(Sd),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(n,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||j_.getNormalMatrix(e),n=this.coplanarPoint(Sd).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Q_=0,Gt=class extends ai{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Q_++}),this.uuid=Ai(),this.name="",this.type="Material",this.blending=ir,this.side=Bn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=xu,this.blendDst=vu,this.blendEquation=hs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ae(0,0,0),this.blendAlpha=0,this.depthFunc=Ds,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Df,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=oo,this.stencilZFail=oo,this.stencilZPass=oo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){_e(`Material: parameter '${t}' has value of undefined.`);continue}let n=this[t];if(n===void 0){_e(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=n(e.textures),a=n(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ae().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new vi().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Z().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Z().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let n=t.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},ns=class extends Gt{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new ae(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Tr,Ja=new C,Er=new C,Ar=new C,Cr=new Z,$a=new Z,Wg=new qe,Cc=new C,ja=new C,Rc=new C,Kp=new Z,wd=new Z,Jp=new Z,ks=class extends ct{constructor(e=new ns){if(super(),this.isSprite=!0,this.type="Sprite",Tr===void 0){Tr=new Ye;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new zs(t,5);Tr.setIndex([0,1,2,0,2,3]),Tr.setAttribute("position",new is(i,3,0,!1)),Tr.setAttribute("uv",new is(i,2,3,!1))}this.geometry=Tr,this.material=e,this.center=new Z(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&Ue('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Er.setFromMatrixScale(this.matrixWorld),Wg.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ar.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Er.multiplyScalar(-Ar.z);let i=this.material.rotation,n,r;i!==0&&(r=Math.cos(i),n=Math.sin(i));let a=this.center;Pc(Cc.set(-.5,-.5,0),Ar,a,Er,n,r),Pc(ja.set(.5,-.5,0),Ar,a,Er,n,r),Pc(Rc.set(.5,.5,0),Ar,a,Er,n,r),Kp.set(0,0),wd.set(1,0),Jp.set(1,1);let o=e.ray.intersectTriangle(Cc,ja,Rc,!1,Ja);if(o===null&&(Pc(ja.set(-.5,.5,0),Ar,a,Er,n,r),wd.set(0,1),o=e.ray.intersectTriangle(Cc,Rc,ja,!1,Ja),o===null))return;let l=e.ray.origin.distanceTo(Ja);l<e.near||l>e.far||t.push({distance:l,point:Ja.clone(),uv:Qi.getInterpolation(Ja,Cc,ja,Rc,Kp,wd,Jp,new Z),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Pc(s,e,t,i,n,r){Cr.subVectors(s,t).addScalar(.5).multiply(i),n!==void 0?($a.x=r*Cr.x-n*Cr.y,$a.y=n*Cr.x+r*Cr.y):$a.copy(Cr),s.copy(e),s.x+=$a.x,s.y+=$a.y,s.applyMatrix4(Wg)}var Ic=new C,$p=new C,wo=class extends ct{constructor(){super(),this.isLOD=!0,this._currentLevel=0,this.type="LOD",Object.defineProperties(this,{levels:{enumerable:!0,value:[]}}),this.autoUpdate=!0}copy(e){super.copy(e,!1);let t=e.levels;for(let i=0,n=t.length;i<n;i++){let r=t[i];this.addLevel(r.object.clone(),r.distance,r.hysteresis)}return this.autoUpdate=e.autoUpdate,this}addLevel(e,t=0,i=0){t=Math.abs(t);let n=this.levels,r;for(r=0;r<n.length&&!(t<n[r].distance);r++);return n.splice(r,0,{distance:t,hysteresis:i,object:e}),this.add(e),this}removeLevel(e){let t=this.levels;for(let i=0;i<t.length;i++)if(t[i].distance===e){let n=t.splice(i,1);return this.remove(n[0].object),!0}return!1}getCurrentLevel(){return this._currentLevel}getObjectForDistance(e){let t=this.levels;if(t.length>0){let i,n;for(i=1,n=t.length;i<n;i++){let r=t[i].distance;if(t[i].object.visible&&(r-=r*t[i].hysteresis),e<r)break}return t[i-1].object}return null}raycast(e,t){if(this.levels.length>0){Ic.setFromMatrixPosition(this.matrixWorld);let n=e.ray.origin.distanceTo(Ic);this.getObjectForDistance(n).raycast(e,t)}}update(e){let t=this.levels;if(t.length>1){Ic.setFromMatrixPosition(e.matrixWorld),$p.setFromMatrixPosition(this.matrixWorld);let i=Ic.distanceTo($p)/e.zoom;t[0].object.visible=!0;let n,r;for(n=1,r=t.length;n<r;n++){let a=t[n].distance;if(t[n].object.visible&&(a-=a*t[n].hysteresis),i>=a)t[n-1].object.visible=!1,t[n].object.visible=!0;else break}for(this._currentLevel=n-1;n<r;n++)t[n].object.visible=!1}}toJSON(e){let t=super.toJSON(e);t.object.autoUpdate=this.autoUpdate,t.object.levels=[];let i=this.levels;for(let n=0,r=i.length;n<r;n++){let a=i[n];t.object.levels.push({object:a.object.uuid,distance:a.distance,hysteresis:a.hysteresis})}return t}},Pn=new C,Td=new C,Dc=new C,Lc=new C,nn=class{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Pn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Pn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Pn.copy(this.origin).addScaledVector(this.direction,t),Pn.distanceToSquared(e))}distanceSqToSegment(e,t,i,n){Td.copy(e).add(t).multiplyScalar(.5),Dc.copy(t).sub(e).normalize(),Lc.copy(this.origin).sub(Td);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Dc),o=Lc.dot(this.direction),l=-Lc.dot(Dc),c=Lc.lengthSq(),h=Math.abs(1-a*a),d,u,f,p;if(h>0)if(d=a*l-o,u=a*o-l,p=r*h,d>=0)if(u>=-p)if(u<=p){let _=1/h;d*=_,u*=_,f=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u<=-p?(d=Math.max(0,-(-a*r+o)),u=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c):u<=p?(d=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(d=Math.max(0,-(a*r+o)),u=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c);else u=a>0?-r:r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(Td).addScaledVector(Dc,u),f}intersectSphere(e,t){if(e.radius<0)return null;Pn.subVectors(e.center,this.origin);let i=Pn.dot(this.direction),n=Pn.dot(Pn)-i*i,r=e.radius*e.radius;if(n>r)return null;let a=Math.sqrt(r-n),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,n,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(i=(e.min.x-u.x)*c,n=(e.max.x-u.x)*c):(i=(e.max.x-u.x)*c,n=(e.min.x-u.x)*c),h>=0?(r=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),i>a||r>n||((r>i||isNaN(i))&&(i=r),(a<n||isNaN(n))&&(n=a),d>=0?(o=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(o=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),i>l||o>n)||((o>i||i!==i)&&(i=o),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,t)}intersectsBox(e){return this.intersectBox(e,Pn)!==null}intersectTriangle(e,t,i,n,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,d=e.x-a.x,u=e.y-a.y,f=e.z-a.z,p=t.x-a.x,_=t.y-a.y,g=t.z-a.z,m=i.x-a.x,y=i.y-a.y,w=i.z-a.z,v=Math.abs(l),b=Math.abs(c),M=Math.abs(h),A,x,T,R,I,U,O,D,B,X,k,ne;if(v>=b&&v>=M?(T=l,U=d,B=p,ne=m,l>=0?(A=c,x=h,R=u,I=f,O=_,D=g,X=y,k=w):(A=h,x=c,R=f,I=u,O=g,D=_,X=w,k=y)):b>=M?(T=c,U=u,B=_,ne=y,c>=0?(A=h,x=l,R=f,I=d,O=g,D=p,X=w,k=m):(A=l,x=h,R=d,I=f,O=p,D=g,X=m,k=w)):(T=h,U=f,B=g,ne=w,h>=0?(A=l,x=c,R=d,I=u,O=p,D=_,X=m,k=y):(A=c,x=l,R=u,I=d,O=_,D=p,X=y,k=m)),T===0)return null;let q=A/T,ee=x/T,$=1/T,H=R-q*U,Q=I-ee*U,Ie=O-q*B,He=D-ee*B,rt=X-q*ne,K=k-ee*ne,se=rt*He-K*Ie,me=H*K-Q*rt,Ve=Ie*Q-He*H;if(n){if(se<0||me<0||Ve<0)return null}else if((se<0||me<0||Ve<0)&&(se>0||me>0||Ve>0))return null;let xe=se+me+Ve;if(xe===0)return null;let Oe=$*(se*U+me*B+Ve*ne);return(xe>0?Oe<0:Oe>0)?null:this.at(Oe/xe,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},dt=class extends Gt{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.combine=_a,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},jp=new qe,Ms=new nn,Nc=new Vt,Qp=new C,Uc=new C,Fc=new C,Oc=new C,Ed=new C,Bc=new C,em=new C,zc=new C,st=class extends ct{constructor(e=new Ye,t=new dt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(n,e);let o=this.morphTargetInfluences;if(r&&o){Bc.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],d=r[l];h!==0&&(Ed.fromBufferAttribute(d,e),a?Bc.addScaledVector(Ed,h):Bc.addScaledVector(Ed.sub(t),h))}t.add(Bc)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Nc.copy(i.boundingSphere),Nc.applyMatrix4(r),Ms.copy(e.ray).recast(e.near),!(Nc.containsPoint(Ms.origin)===!1&&(Ms.intersectSphere(Nc,Qp)===null||Ms.origin.distanceToSquared(Qp)>(e.far-e.near)**2))&&(jp.copy(r).invert(),Ms.copy(e.ray).applyMatrix4(jp),!(i.boundingBox!==null&&Ms.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Ms)))}_computeIntersections(e,t,i){let n,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,_=u.length;p<_;p++){let g=u[p],m=a[g.materialIndex],y=Math.max(g.start,f.start),w=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let v=y,b=w;v<b;v+=3){let M=o.getX(v),A=o.getX(v+1),x=o.getX(v+2);n=kc(this,m,e,i,c,h,d,M,A,x),n&&(n.faceIndex=Math.floor(v/3),n.face.materialIndex=g.materialIndex,t.push(n))}}else{let p=Math.max(0,f.start),_=Math.min(o.count,f.start+f.count);for(let g=p,m=_;g<m;g+=3){let y=o.getX(g),w=o.getX(g+1),v=o.getX(g+2);n=kc(this,a,e,i,c,h,d,y,w,v),n&&(n.faceIndex=Math.floor(g/3),t.push(n))}}else if(l!==void 0)if(Array.isArray(a))for(let p=0,_=u.length;p<_;p++){let g=u[p],m=a[g.materialIndex],y=Math.max(g.start,f.start),w=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let v=y,b=w;v<b;v+=3){let M=v,A=v+1,x=v+2;n=kc(this,m,e,i,c,h,d,M,A,x),n&&(n.faceIndex=Math.floor(v/3),n.face.materialIndex=g.materialIndex,t.push(n))}}else{let p=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let g=p,m=_;g<m;g+=3){let y=g,w=g+1,v=g+2;n=kc(this,a,e,i,c,h,d,y,w,v),n&&(n.faceIndex=Math.floor(g/3),t.push(n))}}}};function ex(s,e,t,i,n,r,a,o){let l;if(e.side===oi?l=i.intersectTriangle(a,r,n,!0,o):l=i.intersectTriangle(n,r,a,e.side===Bn,o),l===null)return null;zc.copy(o),zc.applyMatrix4(s.matrixWorld);let c=t.ray.origin.distanceTo(zc);return c<t.near||c>t.far?null:{distance:c,point:zc.clone(),object:s}}function kc(s,e,t,i,n,r,a,o,l,c){s.getVertexPosition(o,Uc),s.getVertexPosition(l,Fc),s.getVertexPosition(c,Oc);let h=ex(s,e,t,i,Uc,Fc,Oc,em);if(h){let d=new C;Qi.getBarycoord(em,Uc,Fc,Oc,d),n&&(h.uv=Qi.getInterpolatedAttribute(n,o,l,c,d,new Z)),r&&(h.uv1=Qi.getInterpolatedAttribute(r,o,l,c,d,new Z)),a&&(h.normal=Qi.getInterpolatedAttribute(a,o,l,c,d,new C),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new C,materialIndex:0};Qi.getNormal(Uc,Fc,Oc,u.normal),h.face=u,h.barycoord=d}return h}var Qa=new xt,tm=new xt,im=new xt,tx=new xt,nm=new qe,Vc=new C,Ad=new Vt,sm=new qe,Cd=new nn,To=class extends st{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=hh,this.bindMatrix=new qe,this.bindMatrixInverse=new qe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Wt),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Vc),this.boundingBox.expandByPoint(Vc)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Vt),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Vc),this.boundingSphere.expandByPoint(Vc)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let i=this.material,n=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ad.copy(this.boundingSphere),Ad.applyMatrix4(n),e.ray.intersectsSphere(Ad)!==!1&&(sm.copy(n).invert(),Cd.copy(e.ray).applyMatrix4(sm),!(this.boundingBox!==null&&Cd.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Cd)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new xt,t=this.geometry.attributes.skinWeight;for(let i=0,n=t.count;i<n;i++){e.fromBufferAttribute(t,i);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===hh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Ef?this.bindMatrixInverse.copy(this.bindMatrix).invert():_e("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let i=this.skeleton,n=this.geometry;tm.fromBufferAttribute(n.attributes.skinIndex,e),im.fromBufferAttribute(n.attributes.skinWeight,e),t.isVector4?(Qa.copy(t),t.set(0,0,0,0)):(Qa.set(...t,1),t.set(0,0,0)),Qa.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=im.getComponent(r);if(a!==0){let o=tm.getComponent(r);nm.multiplyMatrices(i.bones[o].matrixWorld,i.boneInverses[o]),t.addScaledVector(tx.copy(Qa).applyMatrix4(nm),a)}}return t.isVector4&&(t.w=Qa.w),t.applyMatrix4(this.bindMatrixInverse)}},Zr=class extends ct{constructor(){super(),this.isBone=!0,this.type="Bone"}},fi=class extends Lt{constructor(e=null,t=1,i=1,n,r,a,o,l,c=Dt,h=Dt,d,u){super(null,a,o,l,c,h,n,r,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},rm=new qe,ix=new qe,Eo=class s{constructor(e=[],t=[]){this.uuid=Ai(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){_e("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,n=this.bones.length;i<n;i++)this.boneInverses.push(new qe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let i=new qe;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){let e=this.bones,t=this.boneInverses,i=this.boneMatrices,n=this.boneTexture;for(let r=0,a=e.length;r<a;r++){let o=e[r]?e[r].matrixWorld:ix;rm.multiplyMatrices(o,t[r]),rm.toArray(i,r*16)}n!==null&&(n.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let i=new fi(t,e,e,ri,si);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){let n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,n=e.bones.length;i<n;i++){let r=e.bones[i],a=t[r];a===void 0&&(_e("Skeleton: No bone found with UUID:",r),a=new Zr),this.bones.push(a),this.boneInverses.push(new qe().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,i=this.boneInverses;for(let n=0,r=t.length;n<r;n++){let a=t[n];e.bones.push(a.uuid);let o=i[n];e.boneInverses.push(o.toArray())}return e}},Nn=class extends ft{constructor(e,t,i,n=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Rr=new qe,am=new qe,Gc=[],om=new Wt,nx=new qe,eo=new st,to=new Vt,Nt=class extends st{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Nn(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,nx)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Wt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Rr),om.copy(e.boundingBox).applyMatrix4(Rr),this.boundingBox.union(om)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vt),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Rr),to.copy(e.boundingSphere).applyMatrix4(Rr),this.boundingSphere.union(to)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,a=e*r+1;for(let o=0;o<i.length;o++)i[o]=n[a+o]}raycast(e,t){let i=this.matrixWorld,n=this.count;if(eo.geometry=this.geometry,eo.material=this.material,eo.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),to.copy(this.boundingSphere),to.applyMatrix4(i),e.ray.intersectsSphere(to)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,Rr),am.multiplyMatrices(i,Rr),eo.matrixWorld=am,eo.raycast(e,Gc);for(let a=0,o=Gc.length;a<o;a++){let l=Gc[a];l.instanceId=r,l.object=this,t.push(l)}Gc.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Nn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let i=t.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new fi(new Float32Array(n*this.count),n,this.count,wl,si));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<i.length;c++)a+=i[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=n*e;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},bs=new Vt,sx=new Z(.5,.5),Hc=new C,pn=class{constructor(e=new vi,t=new vi,i=new vi,n=new vi,r=new vi,a=new vi){this.planes=[e,t,i,n,r,a]}set(e,t,i,n,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(n),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=yi,i=!1){let n=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],f=r[7],p=r[8],_=r[9],g=r[10],m=r[11],y=r[12],w=r[13],v=r[14],b=r[15];if(n[0].setComponents(c-a,f-h,m-p,b-y).normalize(),n[1].setComponents(c+a,f+h,m+p,b+y).normalize(),n[2].setComponents(c+o,f+d,m+_,b+w).normalize(),n[3].setComponents(c-o,f-d,m-_,b-w).normalize(),i)n[4].setComponents(l,u,g,v).normalize(),n[5].setComponents(c-l,f-u,m-g,b-v).normalize();else if(n[4].setComponents(c-l,f-u,m-g,b-v).normalize(),t===yi)n[5].setComponents(c+l,f+u,m+g,b+v).normalize();else if(t===es)n[5].setComponents(l,u,g,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),bs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),bs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(bs)}intersectsSprite(e){bs.center.set(0,0,0);let t=sx.distanceTo(e.center);return bs.radius=.7071067811865476+t,bs.applyMatrix4(e.matrixWorld),this.intersectsSphere(bs)}intersectsSphere(e){let t=this.planes,i=e.center,n=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let n=t[i];if(Hc.x=n.normal.x>0?e.max.x:e.min.x,Hc.y=n.normal.y>0?e.max.y:e.min.y,Hc.z=n.normal.z>0?e.max.z:e.min.z,n.distanceToPoint(Hc)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},lm=new qe,Ao=class s{constructor(){this.coordinateSystem=yi,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,i=this._frustums;for(let n=0;n<t.length;n++){let r=t[n];lm.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),i[n]===void 0&&(i[n]=new pn),i[n].setFromProjectionMatrix(lm,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}intersectsObject(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,i=e._frustums;for(let n=0;n<e._count;n++)t[n]===void 0&&(t[n]=new pn),t[n].copy(i[n]);return this._count=e._count,this}clone(){return new s().copy(this)}};function Rd(s,e){return s-e}function rx(s,e){return s.z-e.z}function ax(s,e){return e.z-s.z}var Hd=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,i,n){let r=this.pool,a=this.list;this.index>=r.length&&r.push({start:-1,count:-1,z:-1,index:-1});let o=r[this.index];a.push(o),this.index++,o.start=e,o.count=t,o.z=i,o.index=n}reset(){this.list.length=0,this.index=0}},_i=new qe,ox=new ae(1,1,1),lx=new pn,cx=new Ao,Wc=new Wt,Ss=new Vt,io=new C,cm=new C,hx=new C,Pd=new Hd,ni=new st,Xc=[];function ux(s,e,t=0){let i=e.itemSize;if(s.isInterleavedBufferAttribute||s.array.constructor!==e.array.constructor){let n=s.count;for(let r=0;r<n;r++)for(let a=0;a<i;a++)e.setComponent(r+t,a,s.getComponent(r,a))}else e.array.set(s.array,t*i);e.needsUpdate=!0}function ws(s,e){if(s.constructor!==e.constructor){let t=Math.min(s.length,e.length);for(let i=0;i<t;i++)e[i]=s[i]}else{let t=Math.min(s.length,e.length);e.set(new s.constructor(s.buffer,0,t))}}var Co=class extends st{constructor(e,t,i=t*2,n){super(new Ye,n),this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=e,this._maxVertexCount=t,this._maxIndexCount=i,this._multiDrawCounts=new Int32Array(e),this._multiDrawStarts=new Int32Array(e),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let e=Math.sqrt(this._maxInstanceCount*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4),i=new fi(t,e,e,ri,si);this._matricesTexture=i}_initIndirectTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);let t=new Uint32Array(e*e),i=new fi(t,e,e,Aa,Ii);this._indirectTexture=i}_initColorsTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);let t=new Float32Array(e*e*4).fill(1),i=new fi(t,e,e,ri,si);i.colorSpace=nt.workingColorSpace,this._colorsTexture=i}_initializeGeometry(e){let t=this.geometry,i=this._maxVertexCount,n=this._maxIndexCount;if(this._geometryInitialized===!1){for(let r in e.attributes){let a=e.getAttribute(r),{array:o,itemSize:l,normalized:c}=a,h=new o.constructor(i*l),d=new ft(h,l,c);t.setAttribute(r,d)}if(e.getIndex()!==null){let r=i>65535?new Uint32Array(n):new Uint16Array(n);t.setIndex(new ft(r,1))}this._geometryInitialized=!0}}_validateGeometry(e){let t=this.geometry;if(!!e.getIndex()!=!!t.getIndex())throw new Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let i in t.attributes){if(!e.hasAttribute(i))throw new Error(`THREE.BatchedMesh: Added geometry missing "${i}". All geometries must have consistent attributes.`);let n=e.getAttribute(i),r=t.getAttribute(i);if(n.itemSize!==r.itemSize||n.normalized!==r.normalized)throw new Error("THREE.BatchedMesh: All attributes must have a consistent itemSize and normalized value.")}}validateInstanceId(e){let t=this._instanceInfo;if(e<0||e>=t.length||t[e].active===!1)throw new Error(`THREE.BatchedMesh: Invalid instanceId ${e}. Instance is either out of range or has been deleted.`)}validateGeometryId(e){let t=this._geometryInfo;if(e<0||e>=t.length||t[e].active===!1)throw new Error(`THREE.BatchedMesh: Invalid geometryId ${e}. Geometry is either out of range or has been deleted.`)}setCustomSort(e){return this.customSort=e,this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wt);let e=this.boundingBox,t=this._instanceInfo;e.makeEmpty();for(let i=0,n=t.length;i<n;i++){if(t[i].active===!1)continue;let r=t[i].geometryIndex;this.getMatrixAt(i,_i),this.getBoundingBoxAt(r,Wc).applyMatrix4(_i),e.union(Wc)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vt);let e=this.boundingSphere,t=this._instanceInfo;e.makeEmpty();for(let i=0,n=t.length;i<n;i++){if(t[i].active===!1)continue;let r=t[i].geometryIndex;this.getMatrixAt(i,_i),this.getBoundingSphereAt(r,Ss).applyMatrix4(_i),e.union(Ss)}}addInstance(e){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw new Error("THREE.BatchedMesh: Maximum item count reached.");let i={visible:!0,active:!0,geometryIndex:e},n=null;this._availableInstanceIds.length>0?(this._availableInstanceIds.sort(Rd),n=this._availableInstanceIds.shift(),this._instanceInfo[n]=i):(n=this._instanceInfo.length,this._instanceInfo.push(i));let r=this._matricesTexture;_i.identity().toArray(r.image.data,n*16),r.needsUpdate=!0;let a=this._colorsTexture;return a&&(ox.toArray(a.image.data,n*4),a.needsUpdate=!0),this._visibilityChanged=!0,n}addGeometry(e,t=-1,i=-1){this._initializeGeometry(e),this._validateGeometry(e);let n={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},r=this._geometryInfo;n.vertexStart=this._nextVertexStart,n.reservedVertexCount=t===-1?e.getAttribute("position").count:t;let a=e.getIndex();if(a!==null&&(n.indexStart=this._nextIndexStart,n.reservedIndexCount=i===-1?a.count:i),n.indexStart!==-1&&n.indexStart+n.reservedIndexCount>this._maxIndexCount||n.vertexStart+n.reservedVertexCount>this._maxVertexCount)throw new Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let l;return this._availableGeometryIds.length>0?(this._availableGeometryIds.sort(Rd),l=this._availableGeometryIds.shift(),r[l]=n):(l=this._geometryCount,this._geometryCount++,r.push(n)),this.setGeometryAt(l,e),this._nextIndexStart=n.indexStart+n.reservedIndexCount,this._nextVertexStart=n.vertexStart+n.reservedVertexCount,l}setGeometryAt(e,t){if(e>=this._geometryCount)throw new Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(t);let i=this.geometry,n=i.getIndex()!==null,r=i.getIndex(),a=t.getIndex(),o=this._geometryInfo[e];if(n&&a.count>o.reservedIndexCount||t.attributes.position.count>o.reservedVertexCount)throw new Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let l=o.vertexStart,c=o.reservedVertexCount;o.vertexCount=t.getAttribute("position").count;for(let h in i.attributes){let d=t.getAttribute(h),u=i.getAttribute(h);ux(d,u,l);let f=d.itemSize;for(let p=d.count,_=c;p<_;p++){let g=l+p;for(let m=0;m<f;m++)u.setComponent(g,m,0)}u.needsUpdate=!0,u.addUpdateRange(l*f,c*f)}if(n){let h=o.indexStart,d=o.reservedIndexCount;o.indexCount=t.getIndex().count;for(let u=0;u<a.count;u++)r.setX(h+u,l+a.getX(u));for(let u=a.count,f=d;u<f;u++)r.setX(h+u,l);r.needsUpdate=!0,r.addUpdateRange(h,o.reservedIndexCount)}return o.start=n?o.indexStart:o.vertexStart,o.count=n?o.indexCount:o.vertexCount,o.boundingBox=null,t.boundingBox!==null&&(o.boundingBox=t.boundingBox.clone()),o.boundingSphere=null,t.boundingSphere!==null&&(o.boundingSphere=t.boundingSphere.clone()),this._visibilityChanged=!0,e}deleteGeometry(e){let t=this._geometryInfo;if(e>=t.length||t[e].active===!1)return this;let i=this._instanceInfo;for(let n=0,r=i.length;n<r;n++)i[n].active&&i[n].geometryIndex===e&&this.deleteInstance(n);return t[e].active=!1,this._availableGeometryIds.push(e),this._visibilityChanged=!0,this}deleteInstance(e){return this.validateInstanceId(e),this._instanceInfo[e].active=!1,this._availableInstanceIds.push(e),this._visibilityChanged=!0,this}optimize(){let e=0,t=0,i=this._geometryInfo,n=i.map((a,o)=>o).sort((a,o)=>i[a].vertexStart-i[o].vertexStart),r=this.geometry;for(let a=0,o=i.length;a<o;a++){let l=n[a],c=i[l];if(c.active!==!1){if(r.index!==null){if(c.indexStart!==t){let{indexStart:h,vertexStart:d,reservedIndexCount:u}=c,f=r.index,p=f.array,_=e-d;for(let g=h;g<h+u;g++)p[g]=p[g]+_;f.array.copyWithin(t,h,h+u),f.addUpdateRange(t,u),f.needsUpdate=!0,c.indexStart=t}t+=c.reservedIndexCount}if(c.vertexStart!==e){let{vertexStart:h,reservedVertexCount:d}=c,u=r.attributes;for(let f in u){let p=u[f],{array:_,itemSize:g}=p;_.copyWithin(e*g,h*g,(h+d)*g),p.addUpdateRange(e*g,d*g),p.needsUpdate=!0}c.vertexStart=e}e+=c.reservedVertexCount,c.start=r.index?c.indexStart:c.vertexStart}}return this._nextIndexStart=t,this._nextVertexStart=e,this._visibilityChanged=!0,this}getBoundingBoxAt(e,t){if(e>=this._geometryCount)return null;let i=this.geometry,n=this._geometryInfo[e];if(n.boundingBox===null){let r=new Wt,a=i.index,o=i.attributes.position;for(let l=n.start,c=n.start+n.count;l<c;l++){let h=l;a&&(h=a.getX(h)),r.expandByPoint(io.fromBufferAttribute(o,h))}n.boundingBox=r}return t.copy(n.boundingBox),t}getBoundingSphereAt(e,t){if(e>=this._geometryCount)return null;let i=this.geometry,n=this._geometryInfo[e];if(n.boundingSphere===null){let r=new Vt;this.getBoundingBoxAt(e,Wc),Wc.getCenter(r.center);let a=i.index,o=i.attributes.position,l=0;for(let c=n.start,h=n.start+n.count;c<h;c++){let d=c;a&&(d=a.getX(d)),io.fromBufferAttribute(o,d),l=Math.max(l,r.center.distanceToSquared(io))}r.radius=Math.sqrt(l),n.boundingSphere=r}return t.copy(n.boundingSphere),t}setMatrixAt(e,t){this.validateInstanceId(e);let i=this._matricesTexture,n=this._matricesTexture.image.data;return t.toArray(n,e*16),i.needsUpdate=!0,this}getMatrixAt(e,t){return this.validateInstanceId(e),t.fromArray(this._matricesTexture.image.data,e*16)}setColorAt(e,t){return this.validateInstanceId(e),this._colorsTexture===null&&this._initColorsTexture(),t.toArray(this._colorsTexture.image.data,e*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(e,t){return this.validateInstanceId(e),this._colorsTexture===null?t.isVector4?t.set(1,1,1,1):t.setRGB(1,1,1):t.fromArray(this._colorsTexture.image.data,e*4)}setVisibleAt(e,t){return this.validateInstanceId(e),this._instanceInfo[e].visible===t?this:(this._instanceInfo[e].visible=t,this._visibilityChanged=!0,this)}getVisibleAt(e){return this.validateInstanceId(e),this._instanceInfo[e].visible}setGeometryIdAt(e,t){return this.validateInstanceId(e),this.validateGeometryId(t),this._instanceInfo[e].geometryIndex=t,this._visibilityChanged=!0,this}getGeometryIdAt(e){return this.validateInstanceId(e),this._instanceInfo[e].geometryIndex}getGeometryRangeAt(e,t={}){this.validateGeometryId(e);let i=this._geometryInfo[e];return t.vertexStart=i.vertexStart,t.vertexCount=i.vertexCount,t.reservedVertexCount=i.reservedVertexCount,t.indexStart=i.indexStart,t.indexCount=i.indexCount,t.reservedIndexCount=i.reservedIndexCount,t.start=i.start,t.count=i.count,t}setInstanceCount(e){let t=this._availableInstanceIds,i=this._instanceInfo;for(t.sort(Rd);t[t.length-1]===i.length-1;)i.pop(),t.pop();if(e<i.length)throw new Error(`THREE.BatchedMesh: Instance ids outside the range ${e} are being used. Cannot shrink instance count.`);let n=new Int32Array(e),r=new Int32Array(e);ws(this._multiDrawCounts,n),ws(this._multiDrawStarts,r),this._multiDrawCounts=n,this._multiDrawStarts=r,this._maxInstanceCount=e;let a=this._indirectTexture,o=this._matricesTexture,l=this._colorsTexture;a.dispose(),this._initIndirectTexture(),ws(a.image.data,this._indirectTexture.image.data),o.dispose(),this._initMatricesTexture(),ws(o.image.data,this._matricesTexture.image.data),l&&(l.dispose(),this._initColorsTexture(),ws(l.image.data,this._colorsTexture.image.data))}setGeometrySize(e,t){let i=[...this._geometryInfo].filter(o=>o.active);if(Math.max(...i.map(o=>o.vertexStart+o.reservedVertexCount))>e)throw new Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${t}. Cannot shrink further.`);if(this.geometry.index&&Math.max(...i.map(l=>l.indexStart+l.reservedIndexCount))>t)throw new Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${t}. Cannot shrink further.`);let r=this.geometry;r.dispose(),this._maxVertexCount=e,this._maxIndexCount=t,this._geometryInitialized&&(this._geometryInitialized=!1,this.geometry=new Ye,this._initializeGeometry(r));let a=this.geometry;r.index&&ws(r.index.array,a.index.array);for(let o in r.attributes)ws(r.attributes[o].array,a.attributes[o].array)}raycast(e,t){let i=this._instanceInfo,n=this._geometryInfo,r=this.matrixWorld,a=this.geometry;ni.material=this.material,ni.geometry.index=a.index,ni.geometry.attributes=a.attributes,ni.geometry.boundingBox===null&&(ni.geometry.boundingBox=new Wt),ni.geometry.boundingSphere===null&&(ni.geometry.boundingSphere=new Vt);for(let o=0,l=i.length;o<l;o++){if(!i[o].visible||!i[o].active)continue;let c=i[o].geometryIndex,h=n[c];ni.geometry.setDrawRange(h.start,h.count),this.getMatrixAt(o,ni.matrixWorld).premultiply(r),this.getBoundingBoxAt(c,ni.geometry.boundingBox),this.getBoundingSphereAt(c,ni.geometry.boundingSphere),ni.raycast(e,Xc);for(let d=0,u=Xc.length;d<u;d++){let f=Xc[d];f.object=this,f.batchId=o,t.push(f)}Xc.length=0}ni.material=null,ni.geometry.index=null,ni.geometry.attributes={},ni.geometry.setDrawRange(0,1/0)}copy(e){return super.copy(e),this.geometry=e.geometry.clone(),this.perObjectFrustumCulled=e.perObjectFrustumCulled,this.sortObjects=e.sortObjects,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this._geometryInfo=e._geometryInfo.map(t=>({...t,boundingBox:t.boundingBox!==null?t.boundingBox.clone():null,boundingSphere:t.boundingSphere!==null?t.boundingSphere.clone():null})),this._instanceInfo=e._instanceInfo.map(t=>({...t})),this._availableInstanceIds=e._availableInstanceIds.slice(),this._availableGeometryIds=e._availableGeometryIds.slice(),this._nextIndexStart=e._nextIndexStart,this._nextVertexStart=e._nextVertexStart,this._geometryCount=e._geometryCount,this._maxInstanceCount=e._maxInstanceCount,this._maxVertexCount=e._maxVertexCount,this._maxIndexCount=e._maxIndexCount,this._geometryInitialized=e._geometryInitialized,this._multiDrawCounts=e._multiDrawCounts.slice(),this._multiDrawStarts=e._multiDrawStarts.slice(),this._multiDrawBytesPerElement=e._multiDrawBytesPerElement,this._indirectTexture=e._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=e._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),this._colorsTexture!==null&&(this._colorsTexture=e._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice()),this}dispose(){super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null&&(this._colorsTexture.dispose(),this._colorsTexture=null)}onBeforeRender(e,t,i,n,r){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let a=n.getIndex(),o=a===null?1:a.array.BYTES_PER_ELEMENT,l=1;r.wireframe&&(l=2,o=n.attributes.position.count>65535?4:2);let c=this._instanceInfo,h=this._multiDrawStarts,d=this._multiDrawCounts,u=this._geometryInfo,f=this.perObjectFrustumCulled,p=this._indirectTexture,_=p.image.data,g=i.isArrayCamera?cx:lx;f&&(i.isArrayCamera?g.setFromArrayCamera(i):(_i.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse).multiply(this.matrixWorld),g.setFromProjectionMatrix(_i,i.coordinateSystem,i.reversedDepth)));let m=0;if(this.sortObjects){_i.copy(this.matrixWorld).invert(),io.setFromMatrixPosition(i.matrixWorld).applyMatrix4(_i),cm.set(0,0,-1).transformDirection(i.matrixWorld).transformDirection(_i);for(let v=0,b=c.length;v<b;v++)if(c[v].visible&&c[v].active){let M=c[v].geometryIndex;this.getMatrixAt(v,_i),this.getBoundingSphereAt(M,Ss).applyMatrix4(_i);let A=!1;if(f&&(A=!g.intersectsSphere(Ss)),!A){let x=u[M],T=hx.subVectors(Ss.center,io).dot(cm);Pd.push(x.start,x.count,T,v)}}let y=Pd.list,w=this.customSort;w===null?y.sort(r.transparent?ax:rx):w.call(this,y,i);for(let v=0,b=y.length;v<b;v++){let M=y[v];h[m]=M.start*o*l,d[m]=M.count*l,_[m]=M.index,m++}Pd.reset()}else for(let y=0,w=c.length;y<w;y++)if(c[y].visible&&c[y].active){let v=c[y].geometryIndex,b=!1;if(f&&(this.getMatrixAt(y,_i),this.getBoundingSphereAt(v,Ss).applyMatrix4(_i),b=!g.intersectsSphere(Ss)),!b){let M=u[v];h[m]=M.start*o*l,d[m]=M.count*l,_[m]=y,m++}}p.needsUpdate=!0,this._multiDrawCount=m,this._multiDrawBytesPerElement=o,this._visibilityChanged=!1}onBeforeShadow(e,t,i,n,r,a){this.onBeforeRender(e,null,n,r,a)}},Kt=class extends Gt{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ae(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},bh=new C,Sh=new C,hm=new qe,no=new nn,qc=new Vt,Id=new C,um=new C,sn=class extends ct{constructor(e=new Ye,t=new Kt){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let n=1,r=t.count;n<r;n++)bh.fromBufferAttribute(t,n-1),Sh.fromBufferAttribute(t,n),i[n]=i[n-1],i[n]+=bh.distanceTo(Sh);e.setAttribute("lineDistance",new Te(i,1))}else _e("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,n=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),qc.copy(i.boundingSphere),qc.applyMatrix4(n),qc.radius+=r,e.ray.intersectsSphere(qc)===!1)return;hm.copy(n).invert(),no.copy(e.ray).applyMatrix4(hm);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){let f=Math.max(0,a.start),p=Math.min(h.count,a.start+a.count);for(let _=f,g=p-1;_<g;_+=c){let m=h.getX(_),y=h.getX(_+1),w=Yc(this,e,no,l,m,y,_);w&&t.push(w)}if(this.isLineLoop){let _=h.getX(p-1),g=h.getX(f),m=Yc(this,e,no,l,_,g,p-1);m&&t.push(m)}}else{let f=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let _=f,g=p-1;_<g;_+=c){let m=Yc(this,e,no,l,_,_+1,_);m&&t.push(m)}if(this.isLineLoop){let _=Yc(this,e,no,l,p-1,f,p-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Yc(s,e,t,i,n,r,a){let o=s.geometry.attributes.position;if(bh.fromBufferAttribute(o,n),Sh.fromBufferAttribute(o,r),t.distanceSqToSegment(bh,Sh,Id,um)>i)return;Id.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(Id);if(!(c<e.near||c>e.far))return{distance:c,point:um.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}var dm=new C,fm=new C,Ci=class extends sn{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let n=0,r=t.count;n<r;n+=2)dm.fromBufferAttribute(t,n),fm.fromBufferAttribute(t,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+dm.distanceTo(fm);e.setAttribute("lineDistance",new Te(i,1))}else _e("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Ro=class extends sn{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Kr=class extends Gt{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ae(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},pm=new qe,Wd=new nn,Zc=new Vt,Kc=new C,Po=class extends ct{constructor(e=new Ye,t=new Kr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,n=this.matrixWorld,r=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Zc.copy(i.boundingSphere),Zc.applyMatrix4(n),Zc.radius+=r,e.ray.intersectsSphere(Zc)===!1)return;pm.copy(n).invert(),Wd.copy(e.ray).applyMatrix4(pm);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,d=i.attributes.position;if(c!==null){let u=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let p=u,_=f;p<_;p++){let g=c.getX(p);Kc.fromBufferAttribute(d,g),mm(Kc,g,l,n,e,t,this)}}else{let u=Math.max(0,a.start),f=Math.min(d.count,a.start+a.count);for(let p=u,_=f;p<_;p++)Kc.fromBufferAttribute(d,p),mm(Kc,p,l,n,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function mm(s,e,t,i,n,r,a){let o=Wd.distanceSqToPoint(s);if(o<t){let l=new C;Wd.closestPointToPoint(s,l),l.applyMatrix4(i);let c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Io=class extends Lt{constructor(e,t,i,n,r=Tt,a=Tt,o,l,c){super(e,t,i,n,r,a,o,l,c),this.isVideoTexture=!0,this.generateMipmaps=!1,this._requestVideoFrameCallbackId=0;let h=this;function d(){h.needsUpdate=!0,h._requestVideoFrameCallbackId=e.requestVideoFrameCallback(d)}"requestVideoFrameCallback"in e&&(this._requestVideoFrameCallbackId=e.requestVideoFrameCallback(d))}clone(){return new this.constructor(this.image).copy(this)}update(){let e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}dispose(){this._requestVideoFrameCallbackId!==0&&(this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId),this._requestVideoFrameCallbackId=0),super.dispose()}},wh=class extends Io{constructor(e,t,i,n,r,a,o,l){super({},e,t,i,n,r,a,o,l),this.isVideoFrameTexture=!0}update(){}clone(){return new this.constructor().copy(this)}setFrame(e){this.image=e,this.needsUpdate=!0}},Th=class extends Lt{constructor(e,t){super({width:e,height:t}),this.isFramebufferTexture=!0,this.magFilter=Dt,this.minFilter=Dt,this.generateMipmaps=!1,this.needsUpdate=!0}},Vs=class extends Lt{constructor(e,t,i,n,r,a,o,l,c,h,d,u){super(null,a,o,l,c,h,n,r,d,u),this.isCompressedTexture=!0,this.image={width:t,height:i},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}},Eh=class extends Vs{constructor(e,t,i,n,r,a){super(e,t,i,r,a),this.isCompressedArrayTexture=!0,this.image.depth=n,this.wrapR=di,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Ah=class extends Vs{constructor(e,t,i){super(void 0,e[0].width,e[0].height,t,i,on),this.isCompressedCubeTexture=!0,this.isCubeTexture=!0,this.image=e}},ss=class extends Lt{constructor(e=[],t=on,i,n,r,a,o,l,c,h){super(e,t,i,n,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},mn=class extends Lt{constructor(e,t,i,n,r,a,o,l,c){super(e,t,i,n,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ch=class extends Lt{constructor(e,t,i,n,r,a,o,l,c){super(e,t,i,n,r,a,o,l,c),this.isHTMLTexture=!0,this.generateMipmaps=!1,this.needsUpdate=!0;let h=e?e.parentNode:null;h!==null&&"requestPaint"in h&&(h.onpaint=()=>{this.needsUpdate=!0},h.requestPaint())}dispose(){let e=this.image?this.image.parentNode:null;e!==null&&"onpaint"in e&&(e.onpaint=null),super.dispose()}},Un=class extends Lt{constructor(e,t,i=Ii,n,r,a,o=Dt,l=Dt,c,h=tn,d=1){if(h!==tn&&h!==Vn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:d};super(u,n,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ui(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Do=class extends Un{constructor(e,t=Ii,i=on,n,r,a=Dt,o=Dt,l,c=tn){let h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,i,n,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Jr=class extends Lt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},jt=class s extends Ye{constructor(e=1,t=1,i=1,n=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:n,heightSegments:r,depthSegments:a};let o=this;n=Math.floor(n),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,f=0;p("z","y","x",-1,-1,i,t,e,a,r,0),p("z","y","x",1,-1,i,t,-e,a,r,1),p("x","z","y",1,1,e,i,t,n,a,2),p("x","z","y",1,-1,e,i,-t,n,a,3),p("x","y","z",1,-1,e,t,i,n,r,4),p("x","y","z",-1,-1,e,t,-i,n,r,5),this.setIndex(l),this.setAttribute("position",new Te(c,3)),this.setAttribute("normal",new Te(h,3)),this.setAttribute("uv",new Te(d,2));function p(_,g,m,y,w,v,b,M,A,x,T){let R=v/A,I=b/x,U=v/2,O=b/2,D=M/2,B=A+1,X=x+1,k=0,ne=0,q=new C;for(let ee=0;ee<X;ee++){let $=ee*I-O;for(let H=0;H<B;H++){let Q=H*R-U;q[_]=Q*y,q[g]=$*w,q[m]=D,c.push(q.x,q.y,q.z),q[_]=0,q[g]=0,q[m]=M>0?1:-1,h.push(q.x,q.y,q.z),d.push(H/A),d.push(1-ee/x),k+=1}}for(let ee=0;ee<x;ee++)for(let $=0;$<A;$++){let H=u+$+B*ee,Q=u+$+B*(ee+1),Ie=u+($+1)+B*(ee+1),He=u+($+1)+B*ee;l.push(H,Q,He),l.push(Q,Ie,He),ne+=6}o.addGroup(f,ne,T),f+=ne,u+=k}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},Lo=class s extends Ye{constructor(e=1,t=1,i=4,n=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:i,radialSegments:n,heightSegments:r},t=Math.max(0,t),i=Math.max(1,Math.floor(i)),n=Math.max(3,Math.floor(n)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],h=t/2,d=Math.PI/2*e,u=t,f=2*d+u,p=i*2+r,_=n+1,g=new C,m=new C;for(let y=0;y<=p;y++){let w=0,v=0,b=0,M=0;if(y<=i){let T=y/i,R=T*Math.PI/2;v=-h-e*Math.cos(R),b=e*Math.sin(R),M=-e*Math.cos(R),w=T*d}else if(y<=i+r){let T=(y-i)/r;v=-h+T*t,b=e,M=0,w=d+T*u}else{let T=(y-i-r)/i,R=T*Math.PI/2;v=h+e*Math.sin(R),b=e*Math.cos(R),M=e*Math.sin(R),w=d+u+T*d}let A=Math.max(0,Math.min(1,w/f)),x=0;y===0?x=.5/n:y===p&&(x=-.5/n);for(let T=0;T<=n;T++){let R=T/n,I=R*Math.PI*2,U=Math.sin(I),O=Math.cos(I);m.x=-b*O,m.y=v,m.z=b*U,o.push(m.x,m.y,m.z),g.set(-b*O,M,b*U),g.normalize(),l.push(g.x,g.y,g.z),c.push(R+x,A)}if(y>0){let T=(y-1)*_;for(let R=0;R<n;R++){let I=T+R,U=T+R+1,O=y*_+R,D=y*_+R+1;a.push(I,U,O),a.push(U,D,O)}}}this.setIndex(a),this.setAttribute("position",new Te(o,3)),this.setAttribute("normal",new Te(l,3)),this.setAttribute("uv",new Te(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}},No=class s extends Ye{constructor(e=1,t=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:n},t=Math.max(3,t);let r=[],a=[],o=[],l=[],c=new C,h=new Z;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=t;d++,u+=3){let f=i+d/t*n;c.x=e*Math.cos(f),c.y=e*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[u]/e+1)/2,h.y=(a[u+1]/e+1)/2,l.push(h.x,h.y)}for(let d=1;d<=t;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new Te(a,3)),this.setAttribute("normal",new Te(o,3)),this.setAttribute("uv",new Te(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Bi=class s extends Ye{constructor(e=1,t=1,i=1,n=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:n,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;n=Math.floor(n),r=Math.floor(r);let h=[],d=[],u=[],f=[],p=0,_=[],g=i/2,m=0;y(),a===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(h),this.setAttribute("position",new Te(d,3)),this.setAttribute("normal",new Te(u,3)),this.setAttribute("uv",new Te(f,2));function y(){let v=new C,b=new C,M=0,A=(t-e)/i;for(let x=0;x<=r;x++){let T=[],R=x/r,I=R*(t-e)+e;for(let U=0;U<=n;U++){let O=U/n,D=O*l+o,B=Math.sin(D),X=Math.cos(D);b.x=I*B,b.y=-R*i+g,b.z=I*X,d.push(b.x,b.y,b.z),v.set(B,A,X).normalize(),u.push(v.x,v.y,v.z),f.push(O,1-R),T.push(p++)}_.push(T)}for(let x=0;x<n;x++)for(let T=0;T<r;T++){let R=_[T][x],I=_[T+1][x],U=_[T+1][x+1],O=_[T][x+1];(e>0||T!==0)&&(h.push(R,I,O),M+=3),(t>0||T!==r-1)&&(h.push(I,U,O),M+=3)}c.addGroup(m,M,0),m+=M}function w(v){let b=p,M=new Z,A=new C,x=0,T=v===!0?e:t,R=v===!0?1:-1;for(let U=1;U<=n;U++)d.push(0,g*R,0),u.push(0,R,0),f.push(.5,.5),p++;let I=p;for(let U=0;U<=n;U++){let D=U/n*l+o,B=Math.cos(D),X=Math.sin(D);A.x=T*X,A.y=g*R,A.z=T*B,d.push(A.x,A.y,A.z),u.push(0,R,0),M.x=B*.5+.5,M.y=X*.5*R+.5,f.push(M.x,M.y),p++}for(let U=0;U<n;U++){let O=b+U,D=I+U;v===!0?h.push(D,D+1,O):h.push(D+1,D,O),x+=3}c.addGroup(m,x,v===!0?1:2),m+=x}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},$r=class s extends Bi{constructor(e=1,t=1,i=32,n=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,i,n,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:n,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new s(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Fn=class s extends Ye{constructor(e=[],t=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:n};let r=[],a=[];o(n),c(i),h(),this.setAttribute("position",new Te(r,3)),this.setAttribute("normal",new Te(r.slice(),3)),this.setAttribute("uv",new Te(a,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function o(y){let w=new C,v=new C,b=new C;for(let M=0;M<t.length;M+=3)f(t[M+0],w),f(t[M+1],v),f(t[M+2],b),l(w,v,b,y)}function l(y,w,v,b){let M=b+1,A=[];for(let x=0;x<=M;x++){A[x]=[];let T=y.clone().lerp(v,x/M),R=w.clone().lerp(v,x/M),I=M-x;for(let U=0;U<=I;U++)U===0&&x===M?A[x][U]=T:A[x][U]=T.clone().lerp(R,U/I)}for(let x=0;x<M;x++)for(let T=0;T<2*(M-x)-1;T++){let R=Math.floor(T/2);T%2===0?(u(A[x][R+1]),u(A[x+1][R]),u(A[x][R])):(u(A[x][R+1]),u(A[x+1][R+1]),u(A[x+1][R]))}}function c(y){let w=new C;for(let v=0;v<r.length;v+=3)w.x=r[v+0],w.y=r[v+1],w.z=r[v+2],w.normalize().multiplyScalar(y),r[v+0]=w.x,r[v+1]=w.y,r[v+2]=w.z}function h(){let y=new C;for(let w=0;w<r.length;w+=3){y.x=r[w+0],y.y=r[w+1],y.z=r[w+2];let v=g(y)/2/Math.PI+.5,b=m(y)/Math.PI+.5;a.push(v,1-b)}p(),d()}function d(){for(let y=0;y<a.length;y+=6){let w=a[y+0],v=a[y+2],b=a[y+4],M=Math.max(w,v,b),A=Math.min(w,v,b);M>.9&&A<.1&&(w<.2&&(a[y+0]+=1),v<.2&&(a[y+2]+=1),b<.2&&(a[y+4]+=1))}}function u(y){r.push(y.x,y.y,y.z)}function f(y,w){let v=y*3;w.x=e[v+0],w.y=e[v+1],w.z=e[v+2]}function p(){let y=new C,w=new C,v=new C,b=new C,M=new Z,A=new Z,x=new Z;for(let T=0,R=0;T<r.length;T+=9,R+=6){y.set(r[T+0],r[T+1],r[T+2]),w.set(r[T+3],r[T+4],r[T+5]),v.set(r[T+6],r[T+7],r[T+8]),M.set(a[R+0],a[R+1]),A.set(a[R+2],a[R+3]),x.set(a[R+4],a[R+5]),b.copy(y).add(w).add(v).divideScalar(3);let I=g(b);_(M,R+0,y,I),_(A,R+2,w,I),_(x,R+4,v,I)}}function _(y,w,v,b){b<0&&y.x===1&&(a[w]=y.x-1),v.x===0&&v.z===0&&(a[w]=b/2/Math.PI+.5)}function g(y){return Math.atan2(y.z,-y.x)}function m(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.vertices,e.indices,e.radius,e.detail)}},Uo=class s extends Fn{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,n=1/i,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-n,-i,0,-n,i,0,n,-i,0,n,i,-n,-i,0,-n,i,0,n,-i,0,n,i,0,-i,0,-n,i,0,-n,-i,0,n,i,0,n],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},Jc=new C,$c=new C,Dd=new C,jc=new Qi,Fo=class extends Ye{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let n=Math.pow(10,4),r=Math.cos(Is*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},f=[];for(let p=0;p<l;p+=3){a?(c[0]=a.getX(p),c[1]=a.getX(p+1),c[2]=a.getX(p+2)):(c[0]=p,c[1]=p+1,c[2]=p+2);let{a:_,b:g,c:m}=jc;if(_.fromBufferAttribute(o,c[0]),g.fromBufferAttribute(o,c[1]),m.fromBufferAttribute(o,c[2]),jc.getNormal(Dd),d[0]=`${Math.round(_.x*n)},${Math.round(_.y*n)},${Math.round(_.z*n)}`,d[1]=`${Math.round(g.x*n)},${Math.round(g.y*n)},${Math.round(g.z*n)}`,d[2]=`${Math.round(m.x*n)},${Math.round(m.y*n)},${Math.round(m.z*n)}`,!(d[0]===d[1]||d[1]===d[2]||d[2]===d[0]))for(let y=0;y<3;y++){let w=(y+1)%3,v=d[y],b=d[w],M=jc[h[y]],A=jc[h[w]],x=`${v}_${b}`,T=`${b}_${v}`;T in u&&u[T]?(Dd.dot(u[T].normal)<=r&&(f.push(M.x,M.y,M.z),f.push(A.x,A.y,A.z)),u[T]=null):x in u||(u[x]={index0:c[y],index1:c[w],normal:Dd.clone()})}}for(let p in u)if(u[p]){let{index0:_,index1:g}=u[p];Jc.fromBufferAttribute(o,_),$c.fromBufferAttribute(o,g),f.push(Jc.x,Jc.y,Jc.z),f.push($c.x,$c.y,$c.z)}this.setAttribute("position",new Te(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},Mi=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){_e("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,n=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),r+=i.distanceTo(n),t.push(r),n=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),n=0,r=i.length,a;t?a=t:a=e*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(n=Math.floor(o+(l-o)/2),c=i[n]-a,c<0)o=n+1;else if(c>0)l=n-1;else{l=n;break}if(n=l,i[n]===a)return n/(r-1);let h=i[n],u=i[n+1]-h,f=(a-h)/u;return(n+f)/(r-1)}getTangent(e,t){let n=e-1e-4,r=e+1e-4;n<0&&(n=0),r>1&&(r=1);let a=this.getPoint(n),o=this.getPoint(r),l=t||(a.isVector2?new Z:new C);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new C,n=[],r=[],a=[],o=new C,l=new qe;for(let f=0;f<=e;f++){let p=f/e;n[f]=this.getTangentAt(p,new C)}r[0]=new C,a[0]=new C;let c=Number.MAX_VALUE,h=Math.abs(n[0].x),d=Math.abs(n[0].y),u=Math.abs(n[0].z);h<=c&&(c=h,i.set(1,0,0)),d<=c&&(c=d,i.set(0,1,0)),u<=c&&i.set(0,0,1),o.crossVectors(n[0],i).normalize(),r[0].crossVectors(n[0],o),a[0].crossVectors(n[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(n[f-1],n[f]),o.length()>Number.EPSILON){o.normalize();let p=Math.acos(Ze(n[f-1].dot(n[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,p))}a[f].crossVectors(n[f],r[f])}if(t===!0){let f=Math.acos(Ze(r[0].dot(r[e]),-1,1));f/=e,n[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let p=1;p<=e;p++)r[p].applyMatrix4(l.makeRotationAxis(n[p],f*p)),a[p].crossVectors(n[p],r[p])}return{tangents:n,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Gs=class extends Mi{constructor(e=0,t=0,i=1,n=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=n,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new Z){let i=t,n=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=n;for(;r>n;)r-=n;r<Number.EPSILON&&(a?r=0:r=n),this.aClockwise===!0&&!a&&(r===n?r=-n:r=r-n);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*h-f*d+this.aX,c=u*d+f*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Oo=class extends Gs{constructor(e,t,i,n,r,a){super(e,t,i,i,n,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Vf(){let s=0,e=0,t=0,i=0;function n(r,a,o,l){s=r,e=o,t=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){n(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,d){let u=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,f*=h,n(a,o,u,f)},calc:function(r){let a=r*r,o=a*r;return s+e*r+t*a+i*o}}}var gm=new C,_m=new C,Ld=new Vf,Nd=new Vf,Ud=new Vf,Bo=class extends Mi{constructor(e=[],t=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=n}getPoint(e,t=new C){let i=t,n=this.points,r=n.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=n[(o-1)%r]:(_m.subVectors(n[0],n[1]).add(n[0]),c=_m);let d=n[o%r],u=n[(o+1)%r];if(this.closed||o+2<r?h=n[(o+2)%r]:(gm.subVectors(n[r-1],n[r-2]).add(n[r-1]),h=gm),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,p=Math.pow(c.distanceToSquared(d),f),_=Math.pow(d.distanceToSquared(u),f),g=Math.pow(u.distanceToSquared(h),f);_<1e-4&&(_=1),p<1e-4&&(p=_),g<1e-4&&(g=_),Ld.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,p,_,g),Nd.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,p,_,g),Ud.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,p,_,g)}else this.curveType==="catmullrom"&&(Ld.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),Nd.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),Ud.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return i.set(Ld.calc(l),Nd.calc(l),Ud.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(new C().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function xm(s,e,t,i,n){let r=(i-e)*.5,a=(n-t)*.5,o=s*s,l=s*o;return(2*t-2*i+r+a)*l+(-3*t+3*i-2*r-a)*o+r*s+t}function dx(s,e){let t=1-s;return t*t*e}function fx(s,e){return 2*(1-s)*s*e}function px(s,e){return s*s*e}function co(s,e,t,i){return dx(s,e)+fx(s,t)+px(s,i)}function mx(s,e){let t=1-s;return t*t*t*e}function gx(s,e){let t=1-s;return 3*t*t*s*e}function _x(s,e){return 3*(1-s)*s*s*e}function xx(s,e){return s*s*s*e}function ho(s,e,t,i,n){return mx(s,e)+gx(s,t)+_x(s,i)+xx(s,n)}var jr=class extends Mi{constructor(e=new Z,t=new Z,i=new Z,n=new Z){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=n}getPoint(e,t=new Z){let i=t,n=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(ho(e,n.x,r.x,a.x,o.x),ho(e,n.y,r.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},zo=class extends Mi{constructor(e=new C,t=new C,i=new C,n=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=n}getPoint(e,t=new C){let i=t,n=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(ho(e,n.x,r.x,a.x,o.x),ho(e,n.y,r.y,a.y,o.y),ho(e,n.z,r.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Qr=class extends Mi{constructor(e=new Z,t=new Z){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Z){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Z){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ko=class extends Mi{constructor(e=new C,t=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new C){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new C){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ea=class extends Mi{constructor(e=new Z,t=new Z,i=new Z){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new Z){let i=t,n=this.v0,r=this.v1,a=this.v2;return i.set(co(e,n.x,r.x,a.x),co(e,n.y,r.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ta=class extends Mi{constructor(e=new C,t=new C,i=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new C){let i=t,n=this.v0,r=this.v1,a=this.v2;return i.set(co(e,n.x,r.x,a.x),co(e,n.y,r.y,a.y),co(e,n.z,r.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ia=class extends Mi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Z){let i=t,n=this.points,r=(n.length-1)*e,a=Math.floor(r),o=r-a,l=n[a===0?a:a-1],c=n[a],h=n[a>n.length-2?n.length-1:a+1],d=n[a>n.length-3?n.length-1:a+2];return i.set(xm(o,l.x,c.x,h.x,d.x),xm(o,l.y,c.y,h.y,d.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(new Z().fromArray(n))}return this}},Rh=Object.freeze({__proto__:null,ArcCurve:Oo,CatmullRomCurve3:Bo,CubicBezierCurve:jr,CubicBezierCurve3:zo,EllipseCurve:Gs,LineCurve:Qr,LineCurve3:ko,QuadraticBezierCurve:ea,QuadraticBezierCurve3:ta,SplineCurve:ia}),Vo=class extends Mi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Rh[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),n=this.getCurveLengths(),r=0;for(;r<n.length;){if(n[r]>=i){let a=n[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,n=this.curves.length;i<n;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let n=0,r=this.curves;n<r.length;n++){let a=r[n],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let n=e.curves[t];this.curves.push(new Rh[n.type]().fromJSON(n))}return this}},gn=class extends Vo{constructor(e){super(),this.type="Path",this.currentPoint=new Z,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new Qr(this.currentPoint.clone(),new Z(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,n){let r=new ea(this.currentPoint.clone(),new Z(e,t),new Z(i,n));return this.curves.push(r),this.currentPoint.set(i,n),this}bezierCurveTo(e,t,i,n,r,a){let o=new jr(this.currentPoint.clone(),new Z(e,t),new Z(i,n),new Z(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new ia(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,n,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,i,n,r,a),this}absarc(e,t,i,n,r,a){return this.absellipse(e,t,i,i,n,r,a),this}ellipse(e,t,i,n,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,n,r,a,o,l),this}absellipse(e,t,i,n,r,a,o,l){let c=new Gs(e,t,i,n,r,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},zi=class extends gn{constructor(e){super(e),this.uuid=Ai(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,n=this.holes.length;i<n;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let n=e.holes[t];this.holes.push(new gn().fromJSON(n))}return this}};function vx(s,e,t=2){let i=e&&e.length,n=i?e[0]*t:s.length,r=Xg(s,0,n,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i&&(r=wx(s,e,r,t)),s.length>80*t){o=s[0],l=s[1];let h=o,d=l;for(let u=t;u<n;u+=t){let f=s[u],p=s[u+1];f<o&&(o=f),p<l&&(l=p),f>h&&(h=f),p>d&&(d=p)}c=Math.max(h-o,d-l),c=c!==0?32767/c:0}return Go(r,a,t,o,l,c,0),a}function Xg(s,e,t,i,n){let r;if(n===Ux(s,e,t,i)>0)for(let a=e;a<t;a+=i)r=vm(a/i|0,s[a],s[a+1],r);else for(let a=t-i;a>=e;a-=i)r=vm(a/i|0,s[a],s[a+1],r);return r&&na(r,r.next)&&(Wo(r),r=r.next),r}function Hs(s,e){if(!s)return s;e||(e=s);let t=s,i;do if(i=!1,!t.steiner&&(na(t,t.next)||At(t.prev,t,t.next)===0)){if(Wo(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Go(s,e,t,i,n,r,a){if(!s)return;!a&&r&&Rx(s,i,n,r);let o=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?Mx(s,i,n,r):yx(s)){e.push(l.i,s.i,c.i),Wo(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=bx(Hs(s),e),Go(s,e,t,i,n,r,2)):a===2&&Sx(s,e,t,i,n,r):Go(Hs(s),e,t,i,n,r,1);break}}}function yx(s){let e=s.prev,t=s,i=s.next;if(At(e,t,i)>=0)return!1;let n=e.x,r=t.x,a=i.x,o=e.y,l=t.y,c=i.y,h=Math.min(n,r,a),d=Math.min(o,l,c),u=Math.max(n,r,a),f=Math.max(o,l,c),p=i.next;for(;p!==e;){if(p.x>=h&&p.x<=u&&p.y>=d&&p.y<=f&&ro(n,o,r,l,a,c,p.x,p.y)&&At(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function Mx(s,e,t,i){let n=s.prev,r=s,a=s.next;if(At(n,r,a)>=0)return!1;let o=n.x,l=r.x,c=a.x,h=n.y,d=r.y,u=a.y,f=Math.min(o,l,c),p=Math.min(h,d,u),_=Math.max(o,l,c),g=Math.max(h,d,u),m=Xd(f,p,e,t,i),y=Xd(_,g,e,t,i),w=s.prevZ,v=s.nextZ;for(;w&&w.z>=m&&v&&v.z<=y;){if(w.x>=f&&w.x<=_&&w.y>=p&&w.y<=g&&w!==n&&w!==a&&ro(o,h,l,d,c,u,w.x,w.y)&&At(w.prev,w,w.next)>=0||(w=w.prevZ,v.x>=f&&v.x<=_&&v.y>=p&&v.y<=g&&v!==n&&v!==a&&ro(o,h,l,d,c,u,v.x,v.y)&&At(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;w&&w.z>=m;){if(w.x>=f&&w.x<=_&&w.y>=p&&w.y<=g&&w!==n&&w!==a&&ro(o,h,l,d,c,u,w.x,w.y)&&At(w.prev,w,w.next)>=0)return!1;w=w.prevZ}for(;v&&v.z<=y;){if(v.x>=f&&v.x<=_&&v.y>=p&&v.y<=g&&v!==n&&v!==a&&ro(o,h,l,d,c,u,v.x,v.y)&&At(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function bx(s,e){let t=s;do{let i=t.prev,n=t.next.next;!na(i,n)&&Yg(i,t,t.next,n)&&Ho(i,n)&&Ho(n,i)&&(e.push(i.i,t.i,n.i),Wo(t),Wo(t.next),t=s=n),t=t.next}while(t!==s);return Hs(t)}function Sx(s,e,t,i,n,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Dx(a,o)){let l=Zg(a,o);a=Hs(a,a.next),l=Hs(l,l.next),Go(a,e,t,i,n,r,0),Go(l,e,t,i,n,r,0);return}o=o.next}a=a.next}while(a!==s)}function wx(s,e,t,i){let n=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*i,l=r<a-1?e[r+1]*i:s.length,c=Xg(s,o,l,i,!1);c===c.next&&(c.steiner=!0),n.push(Ix(c))}n.sort(Tx);for(let r=0;r<n.length;r++)t=Ex(n[r],t);return t}function Tx(s,e){let t=s.x-e.x;if(t===0&&(t=s.y-e.y,t===0)){let i=(s.next.y-s.y)/(s.next.x-s.x),n=(e.next.y-e.y)/(e.next.x-e.x);t=i-n}return t}function Ex(s,e){let t=Ax(s,e);if(!t)return e;let i=Zg(t,s);return Hs(i,i.next),Hs(t,t.next)}function Ax(s,e){let t=e,i=s.x,n=s.y,r=-1/0,a;if(na(s,t))return t;do{if(na(s,t.next))return t.next;if(n<=t.y&&n>=t.next.y&&t.next.y!==t.y){let d=t.x+(n-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=i&&d>r&&(r=d,a=t.x<t.next.x?t:t.next,d===i))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;t=a;do{if(i>=t.x&&t.x>=l&&i!==t.x&&qg(n<c?i:r,n,l,c,n<c?r:i,n,t.x,t.y)){let d=Math.abs(n-t.y)/(i-t.x);Ho(t,s)&&(d<h||d===h&&(t.x>a.x||t.x===a.x&&Cx(a,t)))&&(a=t,h=d)}t=t.next}while(t!==o);return a}function Cx(s,e){return At(s.prev,s,e.prev)<0&&At(e.next,s,s.next)<0}function Rx(s,e,t,i){let n=s;do n.z===0&&(n.z=Xd(n.x,n.y,e,t,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==s);n.prevZ.nextZ=null,n.prevZ=null,Px(n)}function Px(s){let e,t=1;do{let i=s,n;s=null;let r=null;for(e=0;i;){e++;let a=i,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||i.z<=a.z)?(n=i,i=i.nextZ,o--):(n=a,a=a.nextZ,l--),r?r.nextZ=n:s=n,n.prevZ=r,r=n;i=a}r.nextZ=null,t*=2}while(e>1);return s}function Xd(s,e,t,i,n){return s=(s-t)*n|0,e=(e-i)*n|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function Ix(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function qg(s,e,t,i,n,r,a,o){return(n-a)*(e-o)>=(s-a)*(r-o)&&(s-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(n-a)*(i-o)}function ro(s,e,t,i,n,r,a,o){return!(s===a&&e===o)&&qg(s,e,t,i,n,r,a,o)}function Dx(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!Lx(s,e)&&(Ho(s,e)&&Ho(e,s)&&Nx(s,e)&&(At(s.prev,s,e.prev)||At(s,e.prev,e))||na(s,e)&&At(s.prev,s,s.next)>0&&At(e.prev,e,e.next)>0)}function At(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function na(s,e){return s.x===e.x&&s.y===e.y}function Yg(s,e,t,i){let n=eh(At(s,e,t)),r=eh(At(s,e,i)),a=eh(At(t,i,s)),o=eh(At(t,i,e));return!!(n!==r&&a!==o||n===0&&Qc(s,t,e)||r===0&&Qc(s,i,e)||a===0&&Qc(t,s,i)||o===0&&Qc(t,e,i))}function Qc(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function eh(s){return s>0?1:s<0?-1:0}function Lx(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&Yg(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function Ho(s,e){return At(s.prev,s,s.next)<0?At(s,e,s.next)>=0&&At(s,s.prev,e)>=0:At(s,e,s.prev)<0||At(s,s.next,e)<0}function Nx(s,e){let t=s,i=!1,n=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&n<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==s);return i}function Zg(s,e){let t=qd(s.i,s.x,s.y),i=qd(e.i,e.x,e.y),n=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=n,n.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function vm(s,e,t,i){let n=qd(s,e,t);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Wo(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function qd(s,e,t){return{i:s,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ux(s,e,t,i){let n=0;for(let r=e,a=t-i;r<t;r+=i)n+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return n}var Yd=class{static triangulate(e,t,i=2){return vx(e,t,i)}},Fi=class s{static area(e){let t=e.length,i=0;for(let n=t-1,r=0;r<t;n=r++)i+=e[n].x*e[r].y-e[r].x*e[n].y;return i*.5}static isClockWise(e){return s.area(e)<0}static triangulateShape(e,t){let i=[],n=[],r=[];ym(e),Mm(i,e);let a=e.length;t.forEach(ym);for(let l=0;l<t.length;l++)n.push(a),a+=t[l].length,Mm(i,t[l]);let o=Yd.triangulate(i,n);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function ym(s){let e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function Mm(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}var Ws=class s extends Ye{constructor(e=new zi([new Z(.5,.5),new Z(-.5,.5),new Z(-.5,-.5),new Z(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,n=[],r=[];for(let o=0,l=e.length;o<l;o++){let c=e[o];a(c)}this.setAttribute("position",new Te(n,3)),this.setAttribute("uv",new Te(r,2)),this.computeVertexNormals();function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,u=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3,m=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:Fx,w,v=!1,b,M,A,x;if(m){w=m.getSpacedPoints(h),v=!0,u=!1;let te=m.isCatmullRomCurve3?m.closed:!1;b=m.computeFrenetFrames(h,te),M=new C,A=new C,x=new C}u||(g=0,f=0,p=0,_=0);let T=o.extractPoints(c),R=T.shape,I=T.holes;if(!Fi.isClockWise(R)){R=R.reverse();for(let te=0,le=I.length;te<le;te++){let ce=I[te];Fi.isClockWise(ce)&&(I[te]=ce.reverse())}}function O(te){let ce=10000000000000001e-36,he=te[0];for(let ge=1;ge<=te.length;ge++){let We=ge%te.length,Ge=te[We],Ke=Ge.x-he.x,je=Ge.y-he.y,L=Ke*Ke+je*je,pt=Math.max(Math.abs(Ge.x),Math.abs(Ge.y),Math.abs(he.x),Math.abs(he.y)),ot=ce*pt*pt;if(L<=ot){te.splice(We,1),ge--;continue}he=Ge}}O(R),I.forEach(O);let D=I.length,B=R;for(let te=0;te<D;te++){let le=I[te];R=R.concat(le)}function X(te,le,ce){return le||Ue("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(le,ce)}let k=R.length;function ne(te,le,ce){let he,ge,We,Ge=te.x-le.x,Ke=te.y-le.y,je=ce.x-te.x,L=ce.y-te.y,pt=Ge*Ge+Ke*Ke,ot=Ge*L-Ke*je;if(Math.abs(ot)>Number.EPSILON){let P=Math.sqrt(pt),S=Math.sqrt(je*je+L*L),z=le.x-Ke/P,W=le.y+Ge/P,J=ce.x-L/S,de=ce.y+je/S,pe=((J-z)*L-(de-W)*je)/(Ge*L-Ke*je);he=z+Ge*pe-te.x,ge=W+Ke*pe-te.y;let j=he*he+ge*ge;if(j<=2)return new Z(he,ge);We=Math.sqrt(j/2)}else{let P=!1;Ge>Number.EPSILON?je>Number.EPSILON&&(P=!0):Ge<-Number.EPSILON?je<-Number.EPSILON&&(P=!0):Math.sign(Ke)===Math.sign(L)&&(P=!0),P?(he=-Ke,ge=Ge,We=Math.sqrt(pt)):(he=Ge,ge=Ke,We=Math.sqrt(pt/2))}return new Z(he/We,ge/We)}let q=[];for(let te=0,le=B.length,ce=le-1,he=te+1;te<le;te++,ce++,he++)ce===le&&(ce=0),he===le&&(he=0),q[te]=ne(B[te],B[ce],B[he]);let ee=[],$,H=q.concat();for(let te=0,le=D;te<le;te++){let ce=I[te];$=[];for(let he=0,ge=ce.length,We=ge-1,Ge=he+1;he<ge;he++,We++,Ge++)We===ge&&(We=0),Ge===ge&&(Ge=0),$[he]=ne(ce[he],ce[We],ce[Ge]);ee.push($),H=H.concat($)}let Q;if(g===0)Q=Fi.triangulateShape(B,I);else{let te=[],le=[];for(let ce=0;ce<g;ce++){let he=ce/g,ge=f*Math.cos(he*Math.PI/2),We=p*Math.sin(he*Math.PI/2)+_;for(let Ge=0,Ke=B.length;Ge<Ke;Ge++){let je=X(B[Ge],q[Ge],We);me(je.x,je.y,-ge),he===0&&te.push(je)}for(let Ge=0,Ke=D;Ge<Ke;Ge++){let je=I[Ge];$=ee[Ge];let L=[];for(let pt=0,ot=je.length;pt<ot;pt++){let P=X(je[pt],$[pt],We);me(P.x,P.y,-ge),he===0&&L.push(P)}he===0&&le.push(L)}}Q=Fi.triangulateShape(te,le)}let Ie=Q.length,He=p+_;for(let te=0;te<k;te++){let le=u?X(R[te],H[te],He):R[te];v?(A.copy(b.normals[0]).multiplyScalar(le.x),M.copy(b.binormals[0]).multiplyScalar(le.y),x.copy(w[0]).add(A).add(M),me(x.x,x.y,x.z)):me(le.x,le.y,0)}for(let te=1;te<=h;te++)for(let le=0;le<k;le++){let ce=u?X(R[le],H[le],He):R[le];v?(A.copy(b.normals[te]).multiplyScalar(ce.x),M.copy(b.binormals[te]).multiplyScalar(ce.y),x.copy(w[te]).add(A).add(M),me(x.x,x.y,x.z)):me(ce.x,ce.y,d/h*te)}for(let te=g-1;te>=0;te--){let le=te/g,ce=f*Math.cos(le*Math.PI/2),he=p*Math.sin(le*Math.PI/2)+_;for(let ge=0,We=B.length;ge<We;ge++){let Ge=X(B[ge],q[ge],he);me(Ge.x,Ge.y,d+ce)}for(let ge=0,We=I.length;ge<We;ge++){let Ge=I[ge];$=ee[ge];for(let Ke=0,je=Ge.length;Ke<je;Ke++){let L=X(Ge[Ke],$[Ke],he);v?me(L.x,L.y+w[h-1].y,w[h-1].x+ce):me(L.x,L.y,d+ce)}}}rt(),K();function rt(){let te=n.length/3;if(u){let le=0,ce=k*le;for(let he=0;he<Ie;he++){let ge=Q[he];Ve(ge[2]+ce,ge[1]+ce,ge[0]+ce)}le=h+g*2,ce=k*le;for(let he=0;he<Ie;he++){let ge=Q[he];Ve(ge[0]+ce,ge[1]+ce,ge[2]+ce)}}else{for(let le=0;le<Ie;le++){let ce=Q[le];Ve(ce[2],ce[1],ce[0])}for(let le=0;le<Ie;le++){let ce=Q[le];Ve(ce[0]+k*h,ce[1]+k*h,ce[2]+k*h)}}i.addGroup(te,n.length/3-te,0)}function K(){let te=n.length/3,le=0;se(B,le),le+=B.length;for(let ce=0,he=I.length;ce<he;ce++){let ge=I[ce];se(ge,le),le+=ge.length}i.addGroup(te,n.length/3-te,1)}function se(te,le){let ce=te.length;for(;--ce>=0;){let he=ce,ge=ce-1;ge<0&&(ge=te.length-1);for(let We=0,Ge=h+g*2;We<Ge;We++){let Ke=k*We,je=k*(We+1),L=le+he+Ke,pt=le+ge+Ke,ot=le+ge+je,P=le+he+je;xe(L,pt,ot,P)}}}function me(te,le,ce){l.push(te),l.push(le),l.push(ce)}function Ve(te,le,ce){Oe(te),Oe(le),Oe(ce);let he=n.length/3,ge=y.generateTopUV(i,n,he-3,he-2,he-1);at(ge[0]),at(ge[1]),at(ge[2])}function xe(te,le,ce,he){Oe(te),Oe(le),Oe(he),Oe(le),Oe(ce),Oe(he);let ge=n.length/3,We=y.generateSideWallUV(i,n,ge-6,ge-3,ge-2,ge-1);at(We[0]),at(We[1]),at(We[3]),at(We[1]),at(We[2]),at(We[3])}function Oe(te){n.push(l[te*3+0]),n.push(l[te*3+1]),n.push(l[te*3+2])}function at(te){r.push(te.x),r.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return Ox(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,a=e.shapes.length;r<a;r++){let o=t[e.shapes[r]];i.push(o)}let n=e.options.extrudePath;return n!==void 0&&(e.options.extrudePath=new Rh[n.type]().fromJSON(n)),new s(i,e.options)}},Fx={generateTopUV:function(s,e,t,i,n){let r=e[t*3],a=e[t*3+1],o=e[i*3],l=e[i*3+1],c=e[n*3],h=e[n*3+1];return[new Z(r,a),new Z(o,l),new Z(c,h)]},generateSideWallUV:function(s,e,t,i,n,r){let a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],d=e[i*3+2],u=e[n*3],f=e[n*3+1],p=e[n*3+2],_=e[r*3],g=e[r*3+1],m=e[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new Z(a,1-l),new Z(c,1-d),new Z(u,1-p),new Z(_,1-m)]:[new Z(o,1-l),new Z(h,1-d),new Z(f,1-p),new Z(g,1-m)]}};function Ox(s,e,t){if(t.shapes=[],Array.isArray(s))for(let i=0,n=s.length;i<n;i++){let r=s[i];t.shapes.push(r.uuid)}else t.shapes.push(s.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var rs=class s extends Fn{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},Xo=class s extends Ye{constructor(e=[new Z(0,-.5),new Z(.5,0),new Z(0,.5)],t=12,i=0,n=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:n},t=Math.floor(t),n=Ze(n,0,Math.PI*2);let r=[],a=[],o=[],l=[],c=[],h=1/t,d=new C,u=new Z,f=new C,p=new C,_=new C,g=0,m=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:g=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,f.x=m*1,f.y=-g,f.z=m*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:g=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,f.x=m*1,f.y=-g,f.z=m*0,p.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(p)}for(let y=0;y<=t;y++){let w=i+y*h*n,v=Math.sin(w),b=Math.cos(w);for(let M=0;M<=e.length-1;M++){d.x=e[M].x*v,d.y=e[M].y,d.z=e[M].x*b,a.push(d.x,d.y,d.z),u.x=y/t,u.y=M/(e.length-1),o.push(u.x,u.y);let A=l[3*M+0]*v,x=l[3*M+1],T=l[3*M+0]*b;c.push(A,x,T)}}for(let y=0;y<t;y++)for(let w=0;w<e.length-1;w++){let v=w+y*e.length,b=v,M=v+e.length,A=v+e.length+1,x=v+1;r.push(b,M,x),r.push(A,x,M)}this.setIndex(r),this.setAttribute("position",new Te(a,3)),this.setAttribute("uv",new Te(o,2)),this.setAttribute("normal",new Te(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.points,e.segments,e.phiStart,e.phiLength)}},ki=class s extends Fn{constructor(e=1,t=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],n=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,n,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},Ri=class s extends Ye{constructor(e=1,t=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:n};let r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(n),c=o+1,h=l+1,d=e/o,u=t/l,f=[],p=[],_=[],g=[];for(let m=0;m<h;m++){let y=m*u-a;for(let w=0;w<c;w++){let v=w*d-r;p.push(v,-y,0),_.push(0,0,1),g.push(w/o),g.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<o;y++){let w=y+c*m,v=y+c*(m+1),b=y+1+c*(m+1),M=y+1+c*m;f.push(w,v,M),f.push(v,b,M)}this.setIndex(f),this.setAttribute("position",new Te(p,3)),this.setAttribute("normal",new Te(_,3)),this.setAttribute("uv",new Te(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.widthSegments,e.heightSegments)}},as=class s extends Ye{constructor(e=.5,t=1,i=32,n=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:n,thetaStart:r,thetaLength:a},i=Math.max(3,i),n=Math.max(1,n);let o=[],l=[],c=[],h=[],d=e,u=(t-e)/n,f=new C,p=new Z;for(let _=0;_<=n;_++){for(let g=0;g<=i;g++){let m=r+g/i*a;f.x=d*Math.cos(m),f.y=d*Math.sin(m),l.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,h.push(p.x,p.y)}d+=u}for(let _=0;_<n;_++){let g=_*(i+1);for(let m=0;m<i;m++){let y=m+g,w=y,v=y+i+1,b=y+i+2,M=y+1;o.push(w,v,M),o.push(v,b,M)}}this.setIndex(o),this.setAttribute("position",new Te(l,3)),this.setAttribute("normal",new Te(c,3)),this.setAttribute("uv",new Te(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Xs=class s extends Ye{constructor(e=new zi([new Z(0,.5),new Z(-.5,-.5),new Z(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],n=[],r=[],a=[],o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(o,l,h),o+=l,l=0;this.setIndex(i),this.setAttribute("position",new Te(n,3)),this.setAttribute("normal",new Te(r,3)),this.setAttribute("uv",new Te(a,2));function c(h){let d=n.length/3,u=h.extractPoints(t),f=u.shape,p=u.holes;Fi.isClockWise(f)===!1&&(f=f.reverse());for(let g=0,m=p.length;g<m;g++){let y=p[g];Fi.isClockWise(y)===!0&&(p[g]=y.reverse())}let _=Fi.triangulateShape(f,p);for(let g=0,m=p.length;g<m;g++){let y=p[g];f=f.concat(y)}for(let g=0,m=f.length;g<m;g++){let y=f[g];n.push(y.x,y.y,0),r.push(0,0,1),a.push(y.x,y.y)}for(let g=0,m=_.length;g<m;g++){let y=_[g],w=y[0]+d,v=y[1]+d,b=y[2]+d;i.push(w,v,b),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Bx(t,e)}static fromJSON(e,t){let i=[];for(let n=0,r=e.shapes.length;n<r;n++){let a=t[e.shapes[n]];i.push(a)}return new s(i,e.curveSegments)}};function Bx(s,e){if(e.shapes=[],Array.isArray(s))for(let t=0,i=s.length;t<i;t++){let n=s[t];e.shapes.push(n.uuid)}else e.shapes.push(s.uuid);return e}var sa=class s extends Ye{constructor(e=1,t=32,i=16,n=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:n,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new C,u=new C,f=[],p=[],_=[],g=[];for(let m=0;m<=i;m++){let y=[],w=m/i,v=a+w*o,b=e*Math.cos(v),M=Math.sqrt(e*e-b*b),A=0;m===0&&a===0?A=.5/t:m===i&&l===Math.PI&&(A=-.5/t);for(let x=0;x<=t;x++){let T=x/t,R=n+T*r;d.x=-M*Math.cos(R),d.y=b,d.z=M*Math.sin(R),p.push(d.x,d.y,d.z),u.copy(d).normalize(),_.push(u.x,u.y,u.z),g.push(T+A,1-w),y.push(c++)}h.push(y)}for(let m=0;m<i;m++)for(let y=0;y<t;y++){let w=h[m][y+1],v=h[m][y],b=h[m+1][y],M=h[m+1][y+1];(m!==0||a>0)&&f.push(w,v,M),(m!==i-1||l<Math.PI)&&f.push(v,b,M)}this.setIndex(f),this.setAttribute("position",new Te(p,3)),this.setAttribute("normal",new Te(_,3)),this.setAttribute("uv",new Te(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}},qo=class s extends Fn{constructor(e=1,t=0){let i=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],n=[2,1,0,0,3,2,1,3,0,2,3,1];super(i,n,e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},rn=class s extends Ye{constructor(e=1,t=.4,i=12,n=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:n,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),n=Math.floor(n);let l=[],c=[],h=[],d=[],u=new C,f=new C,p=new C;for(let _=0;_<=i;_++){let g=a+_/i*o;for(let m=0;m<=n;m++){let y=m/n*r;f.x=(e+t*Math.cos(g))*Math.cos(y),f.y=(e+t*Math.cos(g))*Math.sin(y),f.z=t*Math.sin(g),c.push(f.x,f.y,f.z),u.x=e*Math.cos(y),u.y=e*Math.sin(y),p.subVectors(f,u).normalize(),h.push(p.x,p.y,p.z),d.push(m/n),d.push(_/i)}}for(let _=1;_<=i;_++)for(let g=1;g<=n;g++){let m=(n+1)*_+g-1,y=(n+1)*(_-1)+g-1,w=(n+1)*(_-1)+g,v=(n+1)*_+g;l.push(m,y,v),l.push(y,w,v)}this.setIndex(l),this.setAttribute("position",new Te(c,3)),this.setAttribute("normal",new Te(h,3)),this.setAttribute("uv",new Te(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}},Yo=class s extends Ye{constructor(e=1,t=.4,i=64,n=8,r=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:i,radialSegments:n,p:r,q:a},i=Math.floor(i),n=Math.floor(n);let o=[],l=[],c=[],h=[],d=new C,u=new C,f=new C,p=new C,_=new C,g=new C,m=new C;for(let w=0;w<=i;++w){let v=w/i*r*Math.PI*2;y(v,r,a,e,f),y(v+.01,r,a,e,p),g.subVectors(p,f),m.addVectors(p,f),_.crossVectors(g,m),m.crossVectors(_,g),_.normalize(),m.normalize();for(let b=0;b<=n;++b){let M=b/n*Math.PI*2,A=-t*Math.cos(M),x=t*Math.sin(M);d.x=f.x+(A*m.x+x*_.x),d.y=f.y+(A*m.y+x*_.y),d.z=f.z+(A*m.z+x*_.z),l.push(d.x,d.y,d.z),u.subVectors(d,f).normalize(),c.push(u.x,u.y,u.z),h.push(w/i),h.push(b/n)}}for(let w=1;w<=i;w++)for(let v=1;v<=n;v++){let b=(n+1)*(w-1)+(v-1),M=(n+1)*w+(v-1),A=(n+1)*w+v,x=(n+1)*(w-1)+v;o.push(b,M,x),o.push(M,A,x)}this.setIndex(o),this.setAttribute("position",new Te(l,3)),this.setAttribute("normal",new Te(c,3)),this.setAttribute("uv",new Te(h,2));function y(w,v,b,M,A){let x=Math.cos(w),T=Math.sin(w),R=b/v*w,I=Math.cos(R);A.x=M*(2+I)*.5*x,A.y=M*(2+I)*T*.5,A.z=M*Math.sin(R)*.5}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}},Zo=class s extends Ye{constructor(e=new ta(new C(-1,-1,0),new C(-1,1,0),new C(1,1,0)),t=64,i=1,n=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:n,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new C,l=new C,c=new Z,h=new C,d=[],u=[],f=[],p=[];_(),this.setIndex(p),this.setAttribute("position",new Te(d,3)),this.setAttribute("normal",new Te(u,3)),this.setAttribute("uv",new Te(f,2));function _(){for(let w=0;w<t;w++)g(w);g(r===!1?t:0),y(),m()}function g(w){h=e.getPointAt(w/t,h);let v=a.normals[w],b=a.binormals[w];for(let M=0;M<=n;M++){let A=M/n*Math.PI*2,x=Math.sin(A),T=-Math.cos(A);l.x=T*v.x+x*b.x,l.y=T*v.y+x*b.y,l.z=T*v.z+x*b.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=h.x+i*l.x,o.y=h.y+i*l.y,o.z=h.z+i*l.z,d.push(o.x,o.y,o.z)}}function m(){for(let w=1;w<=t;w++)for(let v=1;v<=n;v++){let b=(n+1)*(w-1)+(v-1),M=(n+1)*w+(v-1),A=(n+1)*w+v,x=(n+1)*(w-1)+v;p.push(b,M,x),p.push(M,A,x)}}function y(){for(let w=0;w<=t;w++)for(let v=0;v<=n;v++)c.x=w/t,c.y=v/n,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new s(new Rh[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},Ko=class extends Ye{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],i=new Set,n=new C,r=new C;if(e.index!==null){let a=e.attributes.position,o=e.index,l=e.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,h=l.length;c<h;++c){let d=l[c],u=d.start,f=d.count;for(let p=u,_=u+f;p<_;p+=3)for(let g=0;g<3;g++){let m=o.getX(p+g),y=o.getX(p+(g+1)%3);n.fromBufferAttribute(a,m),r.fromBufferAttribute(a,y),bm(n,r,i)===!0&&(t.push(n.x,n.y,n.z),t.push(r.x,r.y,r.z))}}}else{let a=e.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){let h=3*o+c,d=3*o+(c+1)%3;n.fromBufferAttribute(a,h),r.fromBufferAttribute(a,d),bm(n,r,i)===!0&&(t.push(n.x,n.y,n.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new Te(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function bm(s,e,t){let i=`${s.x},${s.y},${s.z}-${e.x},${e.y},${e.z}`,n=`${e.x},${e.y},${e.z}-${s.x},${s.y},${s.z}`;return t.has(i)===!0||t.has(n)===!0?!1:(t.add(i),t.add(n),!0)}var Sm=Object.freeze({__proto__:null,BoxGeometry:jt,CapsuleGeometry:Lo,CircleGeometry:No,ConeGeometry:$r,CylinderGeometry:Bi,DodecahedronGeometry:Uo,EdgesGeometry:Fo,ExtrudeGeometry:Ws,IcosahedronGeometry:rs,LatheGeometry:Xo,OctahedronGeometry:ki,PlaneGeometry:Ri,PolyhedronGeometry:Fn,RingGeometry:as,ShapeGeometry:Xs,SphereGeometry:sa,TetrahedronGeometry:qo,TorusGeometry:rn,TorusKnotGeometry:Yo,TubeGeometry:Zo,WireframeGeometry:Ko}),Jo=class extends Gt{constructor(e){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new ae(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}};function or(s){let e={};for(let t in s){e[t]={};for(let i in s[t]){let n=s[t][i];if(wm(n))n.isRenderTargetTexture?(_e("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=n.clone();else if(Array.isArray(n))if(wm(n[0])){let r=[];for(let a=0,o=n.length;a<o;a++)r[a]=n[a].clone();e[t][i]=r}else e[t][i]=n.slice();else e[t][i]=n}}return e}function li(s){let e={};for(let t=0;t<s.length;t++){let i=or(s[t]);for(let n in i)e[n]=i[n]}return e}function wm(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function zx(s){let e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function Gf(s){let e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:nt.workingColorSpace}var bn={clone:or,merge:li},kx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Vx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Rt=class extends Gt{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=kx,this.fragmentShader=Vx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=or(e.uniforms),this.uniformsGroups=zx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let a=this.uniforms[n].value;a&&a.isTexture?t.uniforms[n]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[n]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[n]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[n]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[n]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[n]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[n]={type:"m4",value:a.toArray()}:t.uniforms[n]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let n=e.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=t[n.value]||null;break;case"c":this.uniforms[i].value=new ae().setHex(n.value);break;case"v2":this.uniforms[i].value=new Z().fromArray(n.value);break;case"v3":this.uniforms[i].value=new C().fromArray(n.value);break;case"v4":this.uniforms[i].value=new xt().fromArray(n.value);break;case"m3":this.uniforms[i].value=new Je().fromArray(n.value);break;case"m4":this.uniforms[i].value=new qe().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},os=class extends Rt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ht=class extends Gt{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ae(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yn,this.normalScale=new Z(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},$o=class extends Ht{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Z(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ze(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ae(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ae(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ae(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},jo=class extends Gt{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new ae(16777215),this.specular=new ae(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yn,this.normalScale=new Z(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.combine=_a,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Qo=class extends Gt{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new ae(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yn,this.normalScale=new Z(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},el=class extends Gt{constructor(e){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yn,this.normalScale=new Z(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}},tl=class extends Gt{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yn,this.normalScale=new Z(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.combine=_a,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ra=class extends Gt{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Pf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},aa=class extends Gt{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},il=class extends Gt{constructor(e){super(),this.isMeshMatcapMaterial=!0,this.defines={MATCAP:""},this.type="MeshMatcapMaterial",this.color=new ae(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yn,this.normalScale=new Z(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={MATCAP:""},this.color.copy(e.color),this.matcap=e.matcap,this.map=e.map,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this.fog=e.fog,this}},nl=class extends Kt{constructor(e){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}};function ji(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function uo(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}function Kg(s){function e(n,r){return s[n]-s[r]}let t=s.length,i=new Array(t);for(let n=0;n!==t;++n)i[n]=n;return i.sort(e),i}function Zd(s,e,t){let i=s.length,n=new s.constructor(i);for(let r=0,a=0;a!==i;++r){let o=t[r]*e;for(let l=0;l!==e;++l)n[a++]=s[o+l]}return n}function Jg(s,e,t,i){let n=1,r=s[0];for(;r!==void 0&&r[i]===void 0;)r=s[n++];if(r===void 0)return;let a=r[i];if(a!==void 0)if(Array.isArray(a))do a=r[i],a!==void 0&&(e.push(r.time),t.push(...a)),r=s[n++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[i],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=s[n++];while(r!==void 0);else do a=r[i],a!==void 0&&(e.push(r.time),t.push(a)),r=s[n++];while(r!==void 0)}function Gx(s,e,t,i,n=30){let r=s.clone();r.name=e;let a=[];for(let l=0;l<r.tracks.length;++l){let c=r.tracks[l],h=c.getValueSize(),d=[],u=[];for(let f=0;f<c.times.length;++f){let p=c.times[f]*n;if(!(p<t||p>=i)){d.push(c.times[f]);for(let _=0;_<h;++_)u.push(c.values[f*h+_])}}d.length!==0&&(c.times=ji(d,c.times.constructor),c.values=ji(u,c.values.constructor),a.push(c))}r.tracks=a;let o=1/0;for(let l=0;l<r.tracks.length;++l)o>r.tracks[l].times[0]&&(o=r.tracks[l].times[0]);for(let l=0;l<r.tracks.length;++l)r.tracks[l].shift(-1*o);return r.resetDuration(),r}function Hx(s,e=0,t=s,i=30){i<=0&&(i=30);let n=t.tracks.length,r=e/i;for(let a=0;a<n;++a){let o=t.tracks[a],l=o.ValueTypeName;if(l==="bool"||l==="string")continue;let c=s.tracks.find(function(m){return m.name===o.name&&m.ValueTypeName===l});if(c===void 0)continue;let h=0,d=o.getValueSize();o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(h=d/3);let u=0,f=c.getValueSize();c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(u=f/3);let p=o.times.length-1,_;if(r<=o.times[0]){let m=h,y=d-h;_=o.values.slice(m,y)}else if(r>=o.times[p]){let m=p*d+h,y=m+d-h;_=o.values.slice(m,y)}else{let m=o.createInterpolant(),y=h,w=d-h;m.evaluate(r),_=m.resultBuffer.slice(y,w)}l==="quaternion"&&new bt().fromArray(_).normalize().conjugate().toArray(_);let g=c.times.length;for(let m=0;m<g;++m){let y=m*f+u;if(l==="quaternion")bt.multiplyQuaternionsFlat(c.values,y,_,0,c.values,y);else{let w=f-u*2;for(let v=0;v<w;++v)c.values[y+v]-=_[v]}}}return s.blendMode=Au,s}var Ph=class{static convertArray(e,t){return ji(e,t)}static isTypedArray(e){return Og(e)}static hasTangents(e){return uo(e)}static getKeyframeOrder(e){return Kg(e)}static sortedArray(e,t,i){return Zd(e,t,i)}static flattenJSON(e,t,i,n){Jg(e,t,i,n)}static subclip(e,t,i,n,r=30){return Gx(e,t,i,n,r)}static makeClipAdditive(e,t=0,i=e,n=30){return Hx(e,t,i,n)}},On=class{constructor(e,t,i,n){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,n=t[i],r=t[i-1];e:{t:{let a;i:{n:if(!(e<n)){for(let o=i+2;;){if(n===void 0){if(e<r)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=n,n=t[++i],e<n)break t}a=t.length;break i}if(!(e>=r)){let o=t[1];e<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(n=r,r=t[--i-1],e>=r)break t}a=i,i=0;break i}break e}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(n=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,e,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=e*n;for(let a=0;a!==n;++a)t[a]=i[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},sl=class extends On{constructor(e,t,i,n){super(e,t,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:jn,endingEnd:jn}}intervalChanged_(e,t,i){let n=this.parameterPositions,r=e-2,a=e+1,o=n[r],l=n[a];if(o===void 0)switch(this.getSettings_().endingStart){case Qn:r=e,o=2*t-i;break;case kr:r=n.length-2,o=t+n[r]-n[r+1];break;default:r=e,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Qn:a=e,l=2*i-t;break;case kr:a=1,l=i+n[1]-n[0];break;default:a=e-1,l=t}let c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,p=(i-t)/(n-t),_=p*p,g=_*p,m=-u*g+2*u*_-u*p,y=(1+u)*g+(-1.5-2*u)*_+(-.5+u)*p+1,w=(-1-f)*g+(1.5+f)*_+.5*p,v=f*g-f*_;for(let b=0;b!==o;++b)r[b]=m*a[h+b]+y*a[c+b]+w*a[l+b]+v*a[d+b];return r}},oa=class extends On{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(i-t)/(n-t),d=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*d+a[l+u]*h;return r}},rl=class extends On{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e){return this.copySampleValue_(e-1)}},al=class extends On{interpolate_(e,t,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let p=(i-t)/(n-t),_=1-p;for(let g=0;g!==o;++g)r[g]=a[c+g]*_+a[l+g]*p;return r}let u=o*2,f=e-1;for(let p=0;p!==o;++p){let _=a[c+p],g=a[l+p],m=f*u+p*2,y=d[m],w=d[m+1],v=e*u+p*2,b=h[v],M=h[v+1],A=Xx(i,t,y,b,n);r[p]=$g(A,_,w,M,g)}return r}};function $g(s,e,t,i,n){let r=1-s;return r*r*r*e+3*r*r*s*t+3*r*s*s*i+s*s*s*n}function Wx(s,e,t,i,n){let r=1-s;return 3*r*r*(t-e)+6*r*s*(i-t)+3*s*s*(n-i)}function Xx(s,e,t,i,n){let r=(s-e)/(n-e);for(let a=0;a<8;a++){let o=$g(r,e,t,i,n)-s;if(Math.abs(o)<1e-10)break;let l=Wx(r,e,t,i,n);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var pi=class{constructor(e,t,i,n){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ji(t,this.TimeBufferType),this.values=ji(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:ji(e.times,Array),values:ji(e.values,Array)};let n=e.getInterpolation();n!==e.DefaultInterpolation&&(i.interpolation=n),uo(e.settings)&&(i.settings={inTangents:ji(e.settings.inTangents,Array),outTangents:ji(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new rl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new oa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new sl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new al(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case zr:t=this.InterpolantFactoryMethodDiscrete;break;case yo:t=this.InterpolantFactoryMethodLinear;break;case ao:t=this.InterpolantFactoryMethodSmooth;break;case uh:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return _e("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return zr;case this.InterpolantFactoryMethodLinear:return yo;case this.InterpolantFactoryMethodSmooth:return ao;case this.InterpolantFactoryMethodBezier:return uh}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]*=e;uo(this.settings)&&(Tm(this.settings.inTangents,e),Tm(this.settings.outTangents,e))}return this}trim(e,t){let i=this.times,n=i.length,r=0,a=n-1;for(;r!==n&&i[r]<e;)++r;for(;a!==-1&&i[a]>t;)--a;if(++a,r!==0||a!==n){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ue("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,n=this.values,r=i.length;r===0&&(Ue("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Ue("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){Ue("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(n!==void 0&&Og(n))for(let o=0,l=n.length;o!==l;++o){let c=n[o];if(isNaN(c)){Ue("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===ao,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(n)l=!0;else{let d=o*i,u=d-i,f=d+i;for(let p=0;p!==i;++p){let _=t[d+p];if(_!==t[u+p]||_!==t[f+p]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let d=o*i,u=a*i;for(let f=0;f!==i;++f)t[u+f]=t[d+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,n=new i(this.name,e,t);return n.createInterpolant=this.createInterpolant,uo(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function Tm(s,e){for(let t=0,i=s.length;t!==i;t+=2)s[t]*=e}pi.prototype.ValueTypeName="";pi.prototype.TimeBufferType=Float32Array;pi.prototype.ValueBufferType=Float32Array;pi.prototype.DefaultInterpolation=yo;var _n=class extends pi{constructor(e,t,i){super(e,t,i)}};_n.prototype.ValueTypeName="bool";_n.prototype.ValueBufferType=Array;_n.prototype.DefaultInterpolation=zr;_n.prototype.InterpolantFactoryMethodLinear=void 0;_n.prototype.InterpolantFactoryMethodSmooth=void 0;var la=class extends pi{constructor(e,t,i,n){super(e,t,i,n)}};la.prototype.ValueTypeName="color";var qs=class extends pi{constructor(e,t,i,n){super(e,t,i,n)}};qs.prototype.ValueTypeName="number";var ol=class extends On{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-t)/(n-t),c=e*o;for(let h=c+o;c!==h;c+=4)bt.slerpFlat(r,0,a,c-o,a,c,l);return r}},Ys=class extends pi{constructor(e,t,i,n){super(e,t,i,n)}InterpolantFactoryMethodLinear(e){return new ol(this.times,this.values,this.getValueSize(),e)}};Ys.prototype.ValueTypeName="quaternion";Ys.prototype.InterpolantFactoryMethodSmooth=void 0;var xn=class extends pi{constructor(e,t,i){super(e,t,i)}};xn.prototype.ValueTypeName="string";xn.prototype.ValueBufferType=Array;xn.prototype.DefaultInterpolation=zr;xn.prototype.InterpolantFactoryMethodLinear=void 0;xn.prototype.InterpolantFactoryMethodSmooth=void 0;var ca=class extends pi{constructor(e,t,i,n){super(e,t,i,n)}};ca.prototype.ValueTypeName="vector";var ls=class{constructor(e="",t=-1,i=[],n=nc){this.name=e,this.tracks=i,this.duration=t,this.blendMode=n,this.uuid=Ai(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],i=e.tracks,n=1/(e.fps||1);for(let a=0,o=i.length;a!==o;++a)t.push(Yx(i[a]).scale(n));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],i=e.tracks,n={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=i.length;r!==a;++r)t.push(pi.toJSON(i[r]));return n}static CreateFromMorphTargetSequence(e,t,i,n){let r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);let h=Kg(l);l=Zd(l,1,h),c=Zd(c,1,h),!n&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new qs(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/i))}return new this(e,-1,a)}static findByName(e,t){let i=e;if(!Array.isArray(e)){let n=e;i=n.geometry&&n.geometry.animations||n.animations}for(let n=0;n<i.length;n++)if(i[n].name===t)return i[n];return null}static CreateClipsFromMorphTargetSequences(e,t,i){let n={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){let c=e[o],h=c.name.match(r);if(h&&h.length>1){let d=h[1],u=n[d];u||(n[d]=u=[]),u.push(c)}}let a=[];for(let o in n)a.push(this.CreateFromMorphTargetSequence(o,n[o],t,i));return a}resetDuration(){let e=this.tracks,t=0;for(let i=0,n=e.length;i!==n;++i){let r=this.tracks[i];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let i=0;i<this.tracks.length;i++)e.push(this.tracks[i].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function qx(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return qs;case"vector":case"vector2":case"vector3":case"vector4":return ca;case"color":return la;case"quaternion":return Ys;case"bool":case"boolean":return _n;case"string":return xn}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function Yx(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=qx(s.type);if(s.times===void 0){let i=[],n=[];Jg(s.keys,i,n,"value"),s.times=i,s.values=n}let t;return e.parse!==void 0?t=e.parse(s):t=new e(s.name,s.times,s.values,s.interpolation),uo(s.settings)&&(t.settings={inTangents:ji(s.settings.inTangents,Float32Array),outTangents:ji(s.settings.outTangents,Float32Array)}),t}var en={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(Em(s)||(this.files[s]=e))},get:function(s){if(this.enabled!==!1&&!Em(s))return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};function Em(s){try{let e=s.slice(s.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var ha=class{constructor(e,t,i){let n=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&n.onStart!==void 0&&n.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,n.onProgress!==void 0&&n.onProgress(h,a,o),a===o&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let f=c[d],p=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Hf=new ha,Qt=class{constructor(e){this.manager=e!==void 0?e:Hf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(n,r){i.load(e,n,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Qt.DEFAULT_MATERIAL_NAME="__DEFAULT";var In={},Kd=class extends Error{constructor(e,t){super(e),this.response=t}},Vi=class extends Qt{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,i,n){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=en.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(In[e]!==void 0){In[e].push({onLoad:t,onProgress:i,onError:n});return}In[e]=[],In[e].push({onLoad:t,onProgress:i,onError:n});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&_e("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let h=In[e],d=c.body.getReader(),u=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=u?parseInt(u):0,p=f!==0,_=0,g=new ReadableStream({start(m){y();function y(){d.read().then(({done:w,value:v})=>{if(w)m.close();else{_+=v.byteLength;let b=new ProgressEvent("progress",{lengthComputable:p,loaded:_,total:f});for(let M=0,A=h.length;M<A;M++){let x=h[M];x.onProgress&&x.onProgress(b)}m.enqueue(v),y()}},w=>{m.error(w)})}}});return new Response(g)}else throw new Kd(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o==="")return c.text();{let d=/charset="?([^;"\s]*)"?/i.exec(o),u=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(u);return c.arrayBuffer().then(p=>f.decode(p))}}}).then(c=>{en.add(`file:${e}`,c);let h=In[e];delete In[e];for(let d=0,u=h.length;d<u;d++){let f=h[d];f.onLoad&&f.onLoad(c)}}).catch(c=>{let h=In[e];if(h===void 0)throw this.manager.itemError(e),c;delete In[e];for(let d=0,u=h.length;d<u;d++){let f=h[d];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},Ih=class extends Qt{constructor(e){super(e)}load(e,t,i,n){let r=this,a=new Vi(this.manager);a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(o){try{t(r.parse(JSON.parse(o)))}catch(l){n?n(l):Ue(l),r.manager.itemError(e)}},i,n)}parse(e){let t=[];for(let i=0;i<e.length;i++){let n=ls.parse(e[i]);t.push(n)}return t}},Dh=class extends Qt{constructor(e){super(e)}load(e,t,i,n){let r=this,a=[],o=new Vs,l=new Vi(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(r.withCredentials);let c=0;function h(d){l.load(e[d],function(u){let f=r.parse(u,!0);a[d]={width:f.width,height:f.height,format:f.format,mipmaps:f.mipmaps},c+=1,c===6&&(f.mipmapCount===1&&(o.minFilter=Tt),o.image=a,o.format=f.format,o.needsUpdate=!0,t&&t(o))},i,n)}if(Array.isArray(e))for(let d=0,u=e.length;d<u;++d)h(d);else l.load(e,function(d){let u=r.parse(d,!0);if(u.isCubemap){let f=u.mipmaps.length/u.mipmapCount;for(let p=0;p<f;p++){a[p]={mipmaps:[]};for(let _=0;_<u.mipmapCount;_++)a[p].mipmaps.push(u.mipmaps[p*u.mipmapCount+_]),a[p].format=u.format,a[p].width=u.width,a[p].height=u.height}o.image=a}else o.image.width=u.width,o.image.height=u.height,o.mipmaps=u.mipmaps;u.mipmapCount===1&&(o.minFilter=Tt),o.format=u.format,o.needsUpdate=!0,t&&t(o)},i,n);return o}},Pr=new WeakMap,cs=class extends Qt{constructor(e){super(e)}load(e,t,i,n){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=en.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let d=Pr.get(a);d===void 0&&(d=[],Pr.set(a,d)),d.push({onLoad:t,onError:n})}return a}let o=Hr("img");function l(){h(),t&&t(this);let d=Pr.get(this)||[];for(let u=0;u<d.length;u++){let f=d[u];f.onLoad&&f.onLoad(this)}Pr.delete(this),r.manager.itemEnd(e)}function c(d){h(),n&&n(d),en.remove(`image:${e}`);let u=Pr.get(this)||[];for(let f=0;f<u.length;f++){let p=u[f];p.onError&&p.onError(d)}Pr.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),en.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}},Lh=class extends Qt{constructor(e){super(e)}load(e,t,i,n){let r=new ss;r.colorSpace=zt;let a=new cs(this.manager);a.setCrossOrigin(this.crossOrigin),a.setPath(this.path);let o=0;function l(c){a.load(e[c],function(h){r.images[c]=h,o++,o===6&&(r.needsUpdate=!0,t&&t(r))},void 0,n)}for(let c=0;c<e.length;++c)l(c);return r}},Nh=class extends Qt{constructor(e){super(e)}load(e,t,i,n){let r=this,a=new fi,o=new Vi(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(r.withCredentials),o.load(e,function(l){let c;try{c=r.parse(l)}catch(h){n!==void 0?n(h):Ue(h);return}r._applyTexData(a,c),t&&t(a,c)},i,n),a}createDataTexture(e){let t=new fi;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:di,e.wrapT=t.wrapT!==void 0?t.wrapT:di,e.magFilter=t.magFilter!==void 0?t.magFilter:Tt,e.minFilter=t.minFilter!==void 0?t.minFilter:Tt,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=ln),t.mipmapCount===1&&(e.minFilter=Tt),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}},Uh=class extends Qt{constructor(e){super(e)}load(e,t,i,n){let r=new Lt,a=new cs(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},i,n),r}},an=class extends ct{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ae(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Zs=class extends an{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ae(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Fd=new qe,Am=new C,Cm=new C,Ks=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Z(512,512),this.mapType=gi,this.map=null,this.mapPass=null,this.matrix=new qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new pn,this._frameExtents=new Z(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Am.setFromMatrixPosition(e.matrixWorld),t.position.copy(Am),Cm.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Cm),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,i,n){Fd.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix(Fd,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=n?n.z/r.x:1,o=n?n.w/r.y:1,l=n?n.x/r.x:0,c=n?n.y/r.y:0;e.coordinateSystem===es||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Fd)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},th=new C,ih=new bt,dn=new C,Js=class extends ct{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new qe,this.projectionMatrix=new qe,this.projectionMatrixInverse=new qe,this.coordinateSystem=yi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(th,ih,dn),dn.x===1&&dn.y===1&&dn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(th,ih,dn.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(th,ih,dn),dn.x===1&&dn.y===1&&dn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(th,ih,dn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Jn=new C,Rm=new Z,Pm=new Z,kt=class extends Js{constructor(e=50,t=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ls*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Is*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ls*2*Math.atan(Math.tan(Is*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Jn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Jn.x,Jn.y).multiplyScalar(-e/Jn.z),Jn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Jn.x,Jn.y).multiplyScalar(-e/Jn.z)}getViewSize(e,t){return this.getViewBounds(e,Rm,Pm),t.subVectors(Pm,Rm)}setViewOffset(e,t,i,n,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Is*.5*this.fov)/this.zoom,i=2*t,n=this.aspect*i,r=-.5*n,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*n/l,t-=a.offsetY*i/c,n*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Jd=class extends Ks{constructor(){super(new kt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,i=Ls*2*e.angle*this.focus,n=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(i!==t.fov||n!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=n,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},ll=class extends an{constructor(e,t,i=0,n=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.target=new ct,this.distance=i,this.angle=n,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Jd}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},$d=class extends Ks{constructor(){super(new kt(90,1,.5,500)),this.isPointLightShadow=!0}},$s=class extends an{constructor(e,t,i=0,n=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new $d}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Gi=class extends Js{constructor(e=-1,t=1,i=1,n=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=n,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,n,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,r=i-e,a=i+e,o=n+t,l=n-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},jd=class extends Ks{constructor(){super(new Gi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},vn=class extends an{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.target=new ct,this.shadow=new jd}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},js=class extends an{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}},cl=class extends an{constructor(e,t,i=10,n=10){super(e,t),this.isRectAreaLight=!0,this.type="RectAreaLight",this.width=i,this.height=n}get power(){return this.intensity*this.width*this.height*Math.PI}set power(e){this.intensity=e/(this.width*this.height*Math.PI)}copy(e){return super.copy(e),this.width=e.width,this.height=e.height,this}toJSON(e){let t=super.toJSON(e);return t.object.width=this.width,t.object.height=this.height,t}},ua=class{constructor(){this.isSphericalHarmonics3=!0,this.coefficients=[];for(let e=0;e<9;e++)this.coefficients.push(new C)}set(e){for(let t=0;t<9;t++)this.coefficients[t].copy(e[t]);return this}zero(){for(let e=0;e<9;e++)this.coefficients[e].set(0,0,0);return this}getAt(e,t){let i=e.x,n=e.y,r=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.282095),t.addScaledVector(a[1],.488603*n),t.addScaledVector(a[2],.488603*r),t.addScaledVector(a[3],.488603*i),t.addScaledVector(a[4],1.092548*(i*n)),t.addScaledVector(a[5],1.092548*(n*r)),t.addScaledVector(a[6],.315392*(3*r*r-1)),t.addScaledVector(a[7],1.092548*(i*r)),t.addScaledVector(a[8],.546274*(i*i-n*n)),t}getIrradianceAt(e,t){let i=e.x,n=e.y,r=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.886227),t.addScaledVector(a[1],2*.511664*n),t.addScaledVector(a[2],2*.511664*r),t.addScaledVector(a[3],2*.511664*i),t.addScaledVector(a[4],2*.429043*i*n),t.addScaledVector(a[5],2*.429043*n*r),t.addScaledVector(a[6],.743125*r*r-.247708),t.addScaledVector(a[7],2*.429043*i*r),t.addScaledVector(a[8],.429043*(i*i-n*n)),t}add(e){for(let t=0;t<9;t++)this.coefficients[t].add(e.coefficients[t]);return this}addScaledSH(e,t){for(let i=0;i<9;i++)this.coefficients[i].addScaledVector(e.coefficients[i],t);return this}scale(e){for(let t=0;t<9;t++)this.coefficients[t].multiplyScalar(e);return this}lerp(e,t){for(let i=0;i<9;i++)this.coefficients[i].lerp(e.coefficients[i],t);return this}equals(e){for(let t=0;t<9;t++)if(!this.coefficients[t].equals(e.coefficients[t]))return!1;return!0}copy(e){return this.set(e.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(e,t=0){let i=this.coefficients;for(let n=0;n<9;n++)i[n].fromArray(e,t+n*3);return this}toArray(e=[],t=0){let i=this.coefficients;for(let n=0;n<9;n++)i[n].toArray(e,t+n*3);return e}static getBasisAt(e,t){let i=e.x,n=e.y,r=e.z;t[0]=.282095,t[1]=.488603*n,t[2]=.488603*r,t[3]=.488603*i,t[4]=1.092548*i*n,t[5]=1.092548*n*r,t[6]=.315392*(3*r*r-1),t[7]=1.092548*i*r,t[8]=.546274*(i*i-n*n)}},hl=class extends an{constructor(e=new ua,t=1){super(void 0,t),this.isLightProbe=!0,this.sh=e}copy(e){return super.copy(e),this.sh.copy(e.sh),this}toJSON(e){let t=super.toJSON(e);return t.object.sh=this.sh.toArray(),t}},Im={},ul=class s extends Qt{constructor(e){super(e),this.textures={}}load(e,t,i,n){let r=this,a=new Vi(r.manager);a.setPath(r.path),a.setRequestHeader(r.requestHeader),a.setWithCredentials(r.withCredentials),a.load(e,function(o){try{t(r.parse(JSON.parse(o)))}catch(l){n?n(l):Ue(l),r.manager.itemError(e)}},i,n)}parse(e){let t=this.createMaterialFromType(e.type);return t.fromJSON(e,this.textures),t}setTextures(e){return this.textures=e,this}createMaterialFromType(e){return s.createMaterialFromType(e)}static createMaterialFromType(e){let i={ShadowMaterial:Jo,SpriteMaterial:ns,RawShaderMaterial:os,ShaderMaterial:Rt,PointsMaterial:Kr,MeshPhysicalMaterial:$o,MeshStandardMaterial:Ht,MeshPhongMaterial:jo,MeshToonMaterial:Qo,MeshNormalMaterial:el,MeshLambertMaterial:tl,MeshDepthMaterial:ra,MeshDistanceMaterial:aa,MeshBasicMaterial:dt,MeshMatcapMaterial:il,LineDashedMaterial:nl,LineBasicMaterial:Kt,Material:Gt,...Im}[e],n;return i===void 0?(fn(`MaterialLoader: Unknown material type "${e}". Use .registerMaterial() before starting the deserialization process.`),n=new Gt):n=new i,n}static registerMaterial(e,t){Im[e]=t}},da=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},dl=class extends Ye{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}},fl=class extends Qt{constructor(e){super(e)}load(e,t,i,n){let r=this,a=new Vi(r.manager);a.setPath(r.path),a.setRequestHeader(r.requestHeader),a.setWithCredentials(r.withCredentials),a.load(e,function(o){try{t(r.parse(JSON.parse(o)))}catch(l){n?n(l):Ue(l),r.manager.itemError(e)}},i,n)}parse(e){let t={},i={};function n(f,p){if(t[p]!==void 0)return t[p];let g=f.interleavedBuffers[p],m=r(f,g.buffer),y=Ur(g.type,m),w=new zs(y,g.stride);return w.uuid=g.uuid,g.usage!==void 0&&w.setUsage(g.usage),t[p]=w,w}function r(f,p){if(i[p]!==void 0)return i[p];let g=f.arrayBuffers[p],m=new Uint32Array(g).buffer;return i[p]=m,m}let a=e.isInstancedBufferGeometry?new dl:new Ye,o=e.data.index;if(o!==void 0){let f=Ur(o.type,o.array);a.setIndex(new ft(f,1))}let l=e.data.attributes;for(let f in l){let p=l[f],_;if(p.isInterleavedBufferAttribute){let g=n(e.data,p.data);_=new is(g,p.itemSize,p.offset,p.normalized)}else{let g=Ur(p.type,p.array),m=p.isInstancedBufferAttribute?Nn:ft;_=new m(g,p.itemSize,p.normalized)}p.name!==void 0&&(_.name=p.name),p.usage!==void 0&&_.setUsage(p.usage),p.gpuType!==void 0&&(_.gpuType=p.gpuType),a.setAttribute(f,_)}let c=e.data.morphAttributes;if(c)for(let f in c){let p=c[f],_=[];for(let g=0,m=p.length;g<m;g++){let y=p[g],w;if(y.isInterleavedBufferAttribute){let v=n(e.data,y.data);w=new is(v,y.itemSize,y.offset,y.normalized)}else{let v=Ur(y.type,y.array);w=new ft(v,y.itemSize,y.normalized)}y.name!==void 0&&(w.name=y.name),y.usage!==void 0&&w.setUsage(y.usage),y.gpuType!==void 0&&(w.gpuType=y.gpuType),_.push(w)}a.morphAttributes[f]=_}e.data.morphTargetsRelative&&(a.morphTargetsRelative=!0);let d=e.data.groups||e.data.drawcalls||e.data.offsets;if(d!==void 0)for(let f=0,p=d.length;f!==p;++f){let _=d[f];a.addGroup(_.start,_.count,_.materialIndex)}let u=e.data.boundingSphere;return u!==void 0&&(a.boundingSphere=new Vt().fromJSON(u)),e.name&&(a.name=e.name),e.userData&&(a.userData=e.userData),a}},Od={},Fh=class extends Qt{constructor(e){super(e)}load(e,t,i,n){let r=this,a=this.path===""?da.extractUrlBase(e):this.path;this.resourcePath=this.resourcePath||a;let o=new Vi(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(l){let c=null;try{c=JSON.parse(l)}catch(d){n!==void 0&&n(d),Ue("ObjectLoader: Can't parse "+e+".",d.message);return}let h=c.metadata;if(h===void 0||h.type===void 0||h.type.toLowerCase()==="geometry"){n!==void 0&&n(new Error("THREE.ObjectLoader: Can't load "+e)),Ue("ObjectLoader: Can't load "+e);return}r.parse(c,t)},i,n)}async loadAsync(e,t){let i=this,n=this.path===""?da.extractUrlBase(e):this.path;this.resourcePath=this.resourcePath||n;let r=new Vi(this.manager);r.setPath(this.path),r.setRequestHeader(this.requestHeader),r.setWithCredentials(this.withCredentials);let a=await r.loadAsync(e,t),o;try{o=JSON.parse(a)}catch(c){throw new Error("THREE.ObjectLoader: Can't parse "+e+". "+c.message)}let l=o.metadata;if(l===void 0||l.type===void 0||l.type.toLowerCase()==="geometry")throw new Error("THREE.ObjectLoader: Can't load "+e);return await i.parseAsync(o)}parse(e,t){let i=this.parseAnimations(e.animations),n=this.parseShapes(e.shapes),r=this.parseGeometries(e.geometries,n),a=this.parseImages(e.images,function(){t!==void 0&&t(c)}),o=this.parseTextures(e.textures,a),l=this.parseMaterials(e.materials,o),c=this.parseObject(e.object,r,l,o,i),h=this.parseSkeletons(e.skeletons,c);if(this.bindSkeletons(c,h),this.bindLightTargets(c),t!==void 0){let d=!1;for(let u in a)if(a[u].data instanceof HTMLImageElement){d=!0;break}d===!1&&t(c)}return c}async parseAsync(e){let t=this.parseAnimations(e.animations),i=this.parseShapes(e.shapes),n=this.parseGeometries(e.geometries,i),r=await this.parseImagesAsync(e.images),a=this.parseTextures(e.textures,r),o=this.parseMaterials(e.materials,a),l=this.parseObject(e.object,n,o,a,t),c=this.parseSkeletons(e.skeletons,l);return this.bindSkeletons(l,c),this.bindLightTargets(l),l}static registerGeometry(e,t){Od[e]=t}parseShapes(e){let t={};if(e!==void 0)for(let i=0,n=e.length;i<n;i++){let r=new zi().fromJSON(e[i]);t[r.uuid]=r}return t}parseSkeletons(e,t){let i={},n={};if(t.traverse(function(r){r.isBone&&(n[r.uuid]=r)}),e!==void 0)for(let r=0,a=e.length;r<a;r++){let o=new Eo().fromJSON(e[r],n);i[o.uuid]=o}return i}parseGeometries(e,t){let i={};if(e!==void 0){let n=new fl;for(let r=0,a=e.length;r<a;r++){let o,l=e[r];switch(l.type){case"BufferGeometry":case"InstancedBufferGeometry":o=n.parse(l);break;default:l.type in Sm?o=Sm[l.type].fromJSON(l,t):l.type in Od?o=Od[l.type].fromJSON(l,t):_e(`ObjectLoader: Unknown geometry type "${l.type}". Use .registerGeometry() before starting the deserialization process.`)}o.uuid=l.uuid,l.name!==void 0&&(o.name=l.name),l.userData!==void 0&&(o.userData=l.userData),i[l.uuid]=o}}return i}parseMaterials(e,t){let i={},n={};if(e!==void 0){let r=new ul;r.setTextures(t);for(let a=0,o=e.length;a<o;a++){let l=e[a];i[l.uuid]===void 0&&(i[l.uuid]=r.parse(l)),n[l.uuid]=i[l.uuid]}}return n}parseAnimations(e){let t={};if(e!==void 0)for(let i=0;i<e.length;i++){let n=e[i],r=ls.parse(n);t[r.uuid]=r}return t}parseImages(e,t){let i=this,n={},r;function a(l){return l=i.manager.resolveURL(l),i.manager.itemStart(l),r.load(l,function(){i.manager.itemEnd(l)},void 0,function(){i.manager.itemError(l),i.manager.itemEnd(l)})}function o(l){if(typeof l=="string"){let c=l,h=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(c)?c:i.resourcePath+c;return a(h)}else return l.data?{data:Ur(l.type,l.data),width:l.width,height:l.height}:null}if(e!==void 0&&e.length>0){let l=new ha(t);r=new cs(l),r.setCrossOrigin(this.crossOrigin);for(let c=0,h=e.length;c<h;c++){let d=e[c],u=d.url;if(Array.isArray(u)){let f=[];for(let p=0,_=u.length;p<_;p++){let g=u[p],m=o(g);m!==null&&(m instanceof HTMLImageElement?f.push(m):f.push(new fi(m.data,m.width,m.height)))}n[d.uuid]=new Ui(f)}else{let f=o(d.url);n[d.uuid]=new Ui(f)}}}return n}async parseImagesAsync(e){let t=this,i={},n;async function r(a){if(typeof a=="string"){let o=a,l=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(o)?o:t.resourcePath+o;return await n.loadAsync(l)}else return a.data?{data:Ur(a.type,a.data),width:a.width,height:a.height}:null}if(e!==void 0&&e.length>0){n=new cs(this.manager),n.setCrossOrigin(this.crossOrigin);for(let a=0,o=e.length;a<o;a++){let l=e[a],c=l.url;if(Array.isArray(c)){let h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d],p=await r(f);p!==null&&(p instanceof HTMLImageElement?h.push(p):h.push(new fi(p.data,p.width,p.height)))}i[l.uuid]=new Ui(h)}else{let h=await r(l.url);i[l.uuid]=new Ui(h)}}}return i}parseTextures(e,t){function i(r,a){return typeof r=="number"?r:(_e("ObjectLoader.parseTexture: Constant should be in numeric form.",r),a[r])}let n={};if(e!==void 0)for(let r=0,a=e.length;r<a;r++){let o=e[r];o.image===void 0&&_e('ObjectLoader: No "image" specified for',o.uuid),t[o.image]===void 0&&_e("ObjectLoader: Undefined image",o.image);let l=t[o.image],c=l.data,h;Array.isArray(c)?(h=new ss,c.length===6&&(h.needsUpdate=!0)):(c&&c.data?h=new fi:h=new Lt,c&&(h.needsUpdate=!0)),h.source=l,h.uuid=o.uuid,o.name!==void 0&&(h.name=o.name),o.mapping!==void 0&&(h.mapping=i(o.mapping,Zx)),o.channel!==void 0&&(h.channel=o.channel),o.offset!==void 0&&h.offset.fromArray(o.offset),o.repeat!==void 0&&h.repeat.fromArray(o.repeat),o.center!==void 0&&h.center.fromArray(o.center),o.rotation!==void 0&&(h.rotation=o.rotation),o.wrap!==void 0&&(h.wrapS=i(o.wrap[0],Dm),h.wrapT=i(o.wrap[1],Dm)),o.format!==void 0&&(h.format=o.format),o.internalFormat!==void 0&&(h.internalFormat=o.internalFormat),o.type!==void 0&&(h.type=o.type),o.colorSpace!==void 0&&(h.colorSpace=o.colorSpace),o.minFilter!==void 0&&(h.minFilter=i(o.minFilter,Lm)),o.magFilter!==void 0&&(h.magFilter=i(o.magFilter,Lm)),o.anisotropy!==void 0&&(h.anisotropy=o.anisotropy),o.flipY!==void 0&&(h.flipY=o.flipY),o.generateMipmaps!==void 0&&(h.generateMipmaps=o.generateMipmaps),o.premultiplyAlpha!==void 0&&(h.premultiplyAlpha=o.premultiplyAlpha),o.unpackAlignment!==void 0&&(h.unpackAlignment=o.unpackAlignment),o.compareFunction!==void 0&&(h.compareFunction=o.compareFunction),o.normalized!==void 0&&(h.normalized=o.normalized),o.userData!==void 0&&(h.userData=o.userData),n[o.uuid]=h}return n}parseObject(e,t,i,n,r){let a;function o(u){return t[u]===void 0&&_e("ObjectLoader: Undefined geometry",u),t[u]}function l(u){if(u!==void 0){if(Array.isArray(u)){let f=[];for(let p=0,_=u.length;p<_;p++){let g=u[p];i[g]===void 0&&_e("ObjectLoader: Undefined material",g),f.push(i[g])}return f}return i[u]===void 0&&_e("ObjectLoader: Undefined material",u),i[u]}}function c(u){return n[u]===void 0&&_e("ObjectLoader: Undefined texture",u),n[u]}let h,d;switch(e.type){case"Scene":a=new Bs,e.background!==void 0&&(Number.isInteger(e.background)?a.background=new ae(e.background):a.background=c(e.background)),e.environment!==void 0&&(a.environment=c(e.environment)),e.fog!==void 0&&(e.fog.type==="Fog"?a.fog=new So(e.fog.color,e.fog.near,e.fog.far):e.fog.type==="FogExp2"&&(a.fog=new bo(e.fog.color,e.fog.density)),e.fog.name!==""&&(a.fog.name=e.fog.name)),e.backgroundBlurriness!==void 0&&(a.backgroundBlurriness=e.backgroundBlurriness),e.backgroundIntensity!==void 0&&(a.backgroundIntensity=e.backgroundIntensity),e.backgroundRotation!==void 0&&a.backgroundRotation.fromArray(e.backgroundRotation),e.environmentIntensity!==void 0&&(a.environmentIntensity=e.environmentIntensity),e.environmentRotation!==void 0&&a.environmentRotation.fromArray(e.environmentRotation);break;case"PerspectiveCamera":a=new kt(e.fov,e.aspect,e.near,e.far),e.focus!==void 0&&(a.focus=e.focus),e.zoom!==void 0&&(a.zoom=e.zoom),e.filmGauge!==void 0&&(a.filmGauge=e.filmGauge),e.filmOffset!==void 0&&(a.filmOffset=e.filmOffset),e.view!==void 0&&(a.view=Object.assign({},e.view));break;case"OrthographicCamera":a=new Gi(e.left,e.right,e.top,e.bottom,e.near,e.far),e.zoom!==void 0&&(a.zoom=e.zoom),e.view!==void 0&&(a.view=Object.assign({},e.view));break;case"AmbientLight":a=new js(e.color,e.intensity);break;case"DirectionalLight":a=new vn(e.color,e.intensity),a.target=e.target||"";break;case"PointLight":a=new $s(e.color,e.intensity,e.distance,e.decay);break;case"RectAreaLight":a=new cl(e.color,e.intensity,e.width,e.height);break;case"SpotLight":a=new ll(e.color,e.intensity,e.distance,e.angle,e.penumbra,e.decay),a.target=e.target||"";break;case"HemisphereLight":a=new Zs(e.color,e.groundColor,e.intensity);break;case"LightProbe":let u=new ua().fromArray(e.sh);a=new hl(u,e.intensity);break;case"SkinnedMesh":h=o(e.geometry),d=l(e.material),a=new To(h,d),e.bindMode!==void 0&&(a.bindMode=e.bindMode),e.bindMatrix!==void 0&&a.bindMatrix.fromArray(e.bindMatrix),e.skeleton!==void 0&&(a.skeleton=e.skeleton);break;case"Mesh":h=o(e.geometry),d=l(e.material),a=new st(h,d);break;case"InstancedMesh":h=o(e.geometry),d=l(e.material);let f=e.count,p=e.instanceMatrix,_=e.instanceColor;a=new Nt(h,d,f),a.instanceMatrix=new Nn(new Float32Array(p.array),16),_!==void 0&&(a.instanceColor=new Nn(new Float32Array(_.array),_.itemSize));break;case"BatchedMesh":h=o(e.geometry),d=l(e.material),a=new Co(e.maxInstanceCount,e.maxVertexCount,e.maxIndexCount,d),a.geometry=h,a.perObjectFrustumCulled=e.perObjectFrustumCulled,a.sortObjects=e.sortObjects,a._drawRanges=e.drawRanges,a._reservedRanges=e.reservedRanges,a._geometryInfo=e.geometryInfo.map(g=>{let m=null,y=null;return g.boundingBox!==void 0&&(m=new Wt().fromJSON(g.boundingBox)),g.boundingSphere!==void 0&&(y=new Vt().fromJSON(g.boundingSphere)),{...g,boundingBox:m,boundingSphere:y}}),a._instanceInfo=e.instanceInfo,a._availableInstanceIds=e._availableInstanceIds,a._availableGeometryIds=e._availableGeometryIds,a._nextIndexStart=e.nextIndexStart,a._nextVertexStart=e.nextVertexStart,a._geometryCount=e.geometryCount,a._maxInstanceCount=e.maxInstanceCount,a._maxVertexCount=e.maxVertexCount,a._maxIndexCount=e.maxIndexCount,a._geometryInitialized=e.geometryInitialized,a._matricesTexture=c(e.matricesTexture.uuid),a._indirectTexture=c(e.indirectTexture.uuid),e.colorsTexture!==void 0&&(a._colorsTexture=c(e.colorsTexture.uuid)),e.boundingSphere!==void 0&&(a.boundingSphere=new Vt().fromJSON(e.boundingSphere)),e.boundingBox!==void 0&&(a.boundingBox=new Wt().fromJSON(e.boundingBox));break;case"LOD":a=new wo;break;case"Line":a=new sn(o(e.geometry),l(e.material));break;case"LineLoop":a=new Ro(o(e.geometry),l(e.material));break;case"LineSegments":a=new Ci(o(e.geometry),l(e.material));break;case"PointCloud":case"Points":a=new Po(o(e.geometry),l(e.material));break;case"Sprite":a=new ks(l(e.material));break;case"Group":a=new Ei;break;case"Bone":a=new Zr;break;default:a=new ct}if(a.uuid=e.uuid,e.name!==void 0&&(a.name=e.name),e.matrix!==void 0?(a.matrix.fromArray(e.matrix),e.matrixAutoUpdate!==void 0&&(a.matrixAutoUpdate=e.matrixAutoUpdate),a.matrixAutoUpdate&&a.matrix.decompose(a.position,a.quaternion,a.scale)):(e.position!==void 0&&a.position.fromArray(e.position),e.rotation!==void 0&&a.rotation.fromArray(e.rotation),e.quaternion!==void 0&&a.quaternion.fromArray(e.quaternion),e.scale!==void 0&&a.scale.fromArray(e.scale)),e.up!==void 0&&a.up.fromArray(e.up),e.pivot!==void 0&&(a.pivot=new C().fromArray(e.pivot)),e.morphTargetDictionary!==void 0&&(a.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),e.morphTargetInfluences!==void 0&&(a.morphTargetInfluences=e.morphTargetInfluences.slice()),e.castShadow!==void 0&&(a.castShadow=e.castShadow),e.receiveShadow!==void 0&&(a.receiveShadow=e.receiveShadow),e.shadow&&(e.shadow.intensity!==void 0&&(a.shadow.intensity=e.shadow.intensity),e.shadow.bias!==void 0&&(a.shadow.bias=e.shadow.bias),e.shadow.normalBias!==void 0&&(a.shadow.normalBias=e.shadow.normalBias),e.shadow.radius!==void 0&&(a.shadow.radius=e.shadow.radius),e.shadow.blurSamples!==void 0&&(a.shadow.blurSamples=e.shadow.blurSamples),e.shadow.focus!==void 0&&(a.shadow.focus=e.shadow.focus),e.shadow.aspect!==void 0&&(a.shadow.aspect=e.shadow.aspect),e.shadow.mapSize!==void 0&&a.shadow.mapSize.fromArray(e.shadow.mapSize),e.shadow.camera!==void 0&&(a.shadow.camera=this.parseObject(e.shadow.camera))),e.visible!==void 0&&(a.visible=e.visible),e.frustumCulled!==void 0&&(a.frustumCulled=e.frustumCulled),e.renderOrder!==void 0&&(a.renderOrder=e.renderOrder),e.static!==void 0&&(a.static=e.static),e.userData!==void 0&&(a.userData=e.userData),e.layers!==void 0&&(a.layers.mask=e.layers),e.children!==void 0){let u=e.children;for(let f=0;f<u.length;f++)a.add(this.parseObject(u[f],t,i,n,r))}if(e.animations!==void 0){let u=e.animations;for(let f=0;f<u.length;f++){let p=u[f];a.animations.push(r[p])}}if(e.type==="LOD"){e.autoUpdate!==void 0&&(a.autoUpdate=e.autoUpdate);let u=e.levels;for(let f=0;f<u.length;f++){let p=u[f],_=a.getObjectByProperty("uuid",p.object);_!==void 0&&a.addLevel(_,p.distance,p.hysteresis)}}return a}bindSkeletons(e,t){Object.keys(t).length!==0&&e.traverse(function(i){if(i.isSkinnedMesh===!0&&i.skeleton!==void 0){let n=t[i.skeleton];n===void 0?_e("ObjectLoader: No skeleton found with UUID:",i.skeleton):i.bind(n,i.bindMatrix)}})}bindLightTargets(e){e.traverse(function(t){if(t.isDirectionalLight||t.isSpotLight){let i=t.target,n=e.getObjectByProperty("uuid",i);n!==void 0?t.target=n:t.target=new ct}})}},Zx={UVMapping:yl,CubeReflectionMapping:on,CubeRefractionMapping:kn,EquirectangularReflectionMapping:wa,EquirectangularRefractionMapping:Ta,CubeUVReflectionMapping:nr},Dm={RepeatWrapping:Or,ClampToEdgeWrapping:di,MirroredRepeatWrapping:Br},Lm={NearestFilter:Dt,NearestMipmapNearestFilter:yu,NearestMipmapLinearFilter:sr,LinearFilter:Tt,LinearMipmapNearestFilter:Ea,LinearMipmapLinearFilter:ln},Bd=new WeakMap,Oh=class extends Qt{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&_e("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&_e("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,i,n){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=en.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(c=>{Bd.has(a)===!0?(n&&n(Bd.get(a)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);return}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return en.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){n&&n(c),Bd.set(l,c),en.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});en.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},nh,fa=class{static getContext(){return nh===void 0&&(nh=new(window.AudioContext||window.webkitAudioContext)),nh}static setContext(e){nh=e}},Bh=class extends Qt{constructor(e){super(e)}load(e,t,i,n){let r=this,a=new Vi(this.manager);a.setResponseType("arraybuffer"),a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(l){try{let c=l.slice(0),h=fa.getContext(),d=e+"#decode";r.manager.itemStart(d),h.decodeAudioData(c,function(u){t(u),r.manager.itemEnd(d)}).catch(function(u){o(u),r.manager.itemEnd(d)})}catch(c){o(c)}},i,n);function o(l){n?n(l):Ue(l),r.manager.itemError(e)}}},Nm=new qe,Um=new qe,Ts=new qe,zh=class{constructor(){this.type="StereoCamera",this.aspect=1,this.eyeSep=.064,this.cameraL=new kt,this.cameraL.layers.enable(1),this.cameraL.matrixAutoUpdate=!1,this.cameraR=new kt,this.cameraR.layers.enable(2),this.cameraR.matrixAutoUpdate=!1,this._cache={focus:null,fov:null,aspect:null,near:null,far:null,zoom:null,eyeSep:null}}update(e){let t=this._cache;if(t.focus!==e.focus||t.fov!==e.fov||t.aspect!==e.aspect*this.aspect||t.near!==e.near||t.far!==e.far||t.zoom!==e.zoom||t.eyeSep!==this.eyeSep){t.focus=e.focus,t.fov=e.fov,t.aspect=e.aspect*this.aspect,t.near=e.near,t.far=e.far,t.zoom=e.zoom,t.eyeSep=this.eyeSep,Ts.copy(e.projectionMatrix);let n=t.eyeSep/2,r=n*t.near/t.focus,a=t.near*Math.tan(Is*t.fov*.5)/t.zoom,o,l;Um.elements[12]=-n,Nm.elements[12]=n,o=-a*t.aspect+r,l=a*t.aspect+r,Ts.elements[0]=2*t.near/(l-o),Ts.elements[8]=(l+o)/(l-o),this.cameraL.projectionMatrix.copy(Ts),o=-a*t.aspect-r,l=a*t.aspect-r,Ts.elements[0]=2*t.near/(l-o),Ts.elements[8]=(l+o)/(l-o),this.cameraR.projectionMatrix.copy(Ts)}this.cameraL.matrix.copy(e.matrixWorld).multiply(Um),this.cameraL.matrixWorldNeedsUpdate=!0,this.cameraR.matrix.copy(e.matrixWorld).multiply(Nm),this.cameraR.matrixWorldNeedsUpdate=!0}},Ir=-90,Dr=1,pl=class extends ct{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new kt(Ir,Dr,e,t);n.layers=this.layers,this.add(n);let r=new kt(Ir,Dr,e,t);r.layers=this.layers,this.add(r);let a=new kt(Ir,Dr,e,t);a.layers=this.layers,this.add(a);let o=new kt(Ir,Dr,e,t);o.layers=this.layers,this.add(o);let l=new kt(Ir,Dr,e,t);l.layers=this.layers,this.add(l);let c=new kt(Ir,Dr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,n,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===yi)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===es)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(i,0,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,f),e.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},ml=class extends kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Qs=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=Kx.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function Kx(){this._document.hidden===!1&&this.reset()}var Es=new C,zd=new bt,Jx=new C,As=new C,Cs=new C,kh=class extends ct{constructor(){super(),this.type="AudioListener",this.context=fa.getContext(),this.gain=this.context.createGain(),this.gain.connect(this.context.destination),this.filter=null,this.timeDelta=0,this._timer=new Qs}getInput(){return this.gain}removeFilter(){return this.filter!==null&&(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination),this.gain.connect(this.context.destination),this.filter=null),this}getFilter(){return this.filter}setFilter(e){return this.filter!==null?(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination)):this.gain.disconnect(this.context.destination),this.filter=e,this.gain.connect(this.filter),this.filter.connect(this.context.destination),this}getMasterVolume(){return this.gain.gain.value}setMasterVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}updateMatrixWorld(e){super.updateMatrixWorld(e),this._timer.update();let t=this.context.listener;if(this.timeDelta=this._timer.getDelta(),this.matrixWorld.decompose(Es,zd,Jx),As.set(0,0,-1).applyQuaternion(zd),Cs.set(0,1,0).applyQuaternion(zd),t.positionX){let i=this.context.currentTime+this.timeDelta;t.positionX.linearRampToValueAtTime(Es.x,i),t.positionY.linearRampToValueAtTime(Es.y,i),t.positionZ.linearRampToValueAtTime(Es.z,i),t.forwardX.linearRampToValueAtTime(As.x,i),t.forwardY.linearRampToValueAtTime(As.y,i),t.forwardZ.linearRampToValueAtTime(As.z,i),t.upX.linearRampToValueAtTime(Cs.x,i),t.upY.linearRampToValueAtTime(Cs.y,i),t.upZ.linearRampToValueAtTime(Cs.z,i)}else t.setPosition(Es.x,Es.y,Es.z),t.setOrientation(As.x,As.y,As.z,Cs.x,Cs.y,Cs.z)}},gl=class extends ct{constructor(e){super(),this.type="Audio",this.listener=e,this.context=e.context,this.gain=this.context.createGain(),this.gain.connect(e.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(e){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=e,this.connect(),this}setMediaElementSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(e),this.connect(),this}setMediaStreamSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(e),this.connect(),this}setBuffer(e){return this.buffer=e,this.sourceType="buffer",this.autoplay&&this.play(),this}play(e=0){if(this.isPlaying===!0){_e("Audio: Audio is already playing.");return}if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}this._startedAt=this.context.currentTime+e;let t=this.context.createBufferSource();return t.buffer=this.buffer,t.loop=this.loop,t.loopStart=this.loopStart,t.loopEnd=this.loopEnd,t.onended=this.onEnded.bind(this),t.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=t,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this}stop(e=0){if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}return this._progress=0,this.source!==null&&(this.source.stop(this.context.currentTime+e),this.source.onended=null),this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].connect(this.filters[e]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this._connected!==!1){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].disconnect(this.filters[e]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}}getFilters(){return this.filters}setFilters(e){return e||(e=[]),this._connected===!0?(this.disconnect(),this.filters=e.slice(),this.connect()):this.filters=e.slice(),this}setDetune(e){return this.detune=e,this.isPlaying===!0&&this.source.detune!==void 0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(e){return this.setFilters(e?[e]:[])}setPlaybackRate(e){if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}return this.playbackRate=e,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1,this._progress=0}getLoop(){return this.hasPlaybackControl===!1?(_e("Audio: this Audio has no playback control."),!1):this.loop}setLoop(e){if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}return this.loop=e,this.isPlaying===!0&&(this.source.loop=this.loop),this}setLoopStart(e){return this.loopStart=e,this}setLoopEnd(e){return this.loopEnd=e,this}getVolume(){return this.gain.gain.value}setVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}copy(e,t){return super.copy(e,t),e.sourceType!=="buffer"?(_e("Audio: Audio source type cannot be copied."),this):(this.autoplay=e.autoplay,this.buffer=e.buffer,this.detune=e.detune,this.loop=e.loop,this.loopStart=e.loopStart,this.loopEnd=e.loopEnd,this.offset=e.offset,this.duration=e.duration,this.playbackRate=e.playbackRate,this.hasPlaybackControl=e.hasPlaybackControl,this.sourceType=e.sourceType,this.filters=e.filters.slice(),this)}clone(e){return new this.constructor(this.listener).copy(this,e)}},Rs=new C,Fm=new bt,$x=new C,Ps=new C,Vh=class extends gl{constructor(e){super(e),this.panner=this.context.createPanner(),this.panner.panningModel="HRTF",this.panner.connect(this.gain)}connect(){return super.connect(),this.panner.connect(this.gain),this}disconnect(){return super.disconnect(),this.panner.disconnect(this.gain),this}getOutput(){return this.panner}getRefDistance(){return this.panner.refDistance}setRefDistance(e){return this.panner.refDistance=e,this}getRolloffFactor(){return this.panner.rolloffFactor}setRolloffFactor(e){return this.panner.rolloffFactor=e,this}getDistanceModel(){return this.panner.distanceModel}setDistanceModel(e){return this.panner.distanceModel=e,this}getMaxDistance(){return this.panner.maxDistance}setMaxDistance(e){return this.panner.maxDistance=e,this}setDirectionalCone(e,t,i){return this.panner.coneInnerAngle=e,this.panner.coneOuterAngle=t,this.panner.coneOuterGain=i,this}updateMatrixWorld(e){if(super.updateMatrixWorld(e),this.hasPlaybackControl===!0&&this.isPlaying===!1)return;this.matrixWorld.decompose(Rs,Fm,$x),Ps.set(0,0,1).applyQuaternion(Fm);let t=this.panner;if(t.positionX){let i=this.context.currentTime+this.listener.timeDelta;t.positionX.linearRampToValueAtTime(Rs.x,i),t.positionY.linearRampToValueAtTime(Rs.y,i),t.positionZ.linearRampToValueAtTime(Rs.z,i),t.orientationX.linearRampToValueAtTime(Ps.x,i),t.orientationY.linearRampToValueAtTime(Ps.y,i),t.orientationZ.linearRampToValueAtTime(Ps.z,i)}else t.setPosition(Rs.x,Rs.y,Rs.z),t.setOrientation(Ps.x,Ps.y,Ps.z)}},Gh=class{constructor(e,t=2048){this.analyser=e.context.createAnalyser(),this.analyser.fftSize=t,this.data=new Uint8Array(this.analyser.frequencyBinCount),e.getOutput().connect(this.analyser)}getFrequencyData(){return this.analyser.getByteFrequencyData(this.data),this.data}getAverageFrequency(){let e=0,t=this.getFrequencyData();for(let i=0;i<t.length;i++)e+=t[i];return e/t.length}},_l=class{constructor(e,t,i){this.binding=e,this.valueSize=i;let n,r,a;switch(t){case"quaternion":n=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(i*6),this._workIndex=5;break;case"string":case"bool":n=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(i*5);break;default:n=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(i*5)}this._mixBufferRegion=n,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let i=this.buffer,n=this.valueSize,r=e*n+n,a=this.cumulativeWeight;if(a===0){for(let o=0;o!==n;++o)i[r+o]=i[o];a=t}else{a+=t;let o=t/a;this._mixBufferRegion(i,r,0,o,n)}this.cumulativeWeight=a}accumulateAdditive(e){let t=this.buffer,i=this.valueSize,n=i*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,n,0,e,i),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,i=this.buffer,n=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=t*this._origIndex;this._mixBufferRegion(i,n,l,1-r,t)}a>0&&this._mixBufferRegionAdditive(i,n,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(i[l]!==i[l+t]){o.setValue(i,n);break}}saveOriginalState(){let e=this.binding,t=this.buffer,i=this.valueSize,n=i*this._origIndex;e.getValue(t,n);for(let r=i,a=n;r!==a;++r)t[r]=t[n+r%i];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let i=e;i<t;i++)this.buffer[i]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let i=0;i<this.valueSize;i++)this.buffer[t+i]=this.buffer[e+i]}_select(e,t,i,n,r){if(n>=.5)for(let a=0;a!==r;++a)e[t+a]=e[i+a]}_slerp(e,t,i,n){bt.slerpFlat(e,t,e,t,e,i,n)}_slerpAdditive(e,t,i,n,r){let a=this._workIndex*r;bt.multiplyQuaternionsFlat(e,a,e,t,e,i),bt.slerpFlat(e,t,e,t,e,a,n)}_lerp(e,t,i,n,r){let a=1-n;for(let o=0;o!==r;++o){let l=t+o;e[l]=e[l]*a+e[i+o]*n}}_lerpAdditive(e,t,i,n,r){for(let a=0;a!==r;++a){let o=t+a;e[o]=e[o]+e[i+a]*n}}},Wf="\\[\\]\\.:\\/",jx=new RegExp("["+Wf+"]","g"),Xf="[^"+Wf+"]",Qx="[^"+Wf.replace("\\.","")+"]",ev=/((?:WC+[\/:])*)/.source.replace("WC",Xf),tv=/(WCOD+)?/.source.replace("WCOD",Qx),iv=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Xf),nv=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Xf),sv=new RegExp("^"+ev+tv+iv+nv+"$"),rv=["material","materials","bones","map"],Qd=class{constructor(e,t,i){let n=i||_t.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,n)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,r=i.length;n!==r;++n)i[n].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},_t=class s{constructor(e,t,i){this.path=t,this.parsedPath=i||s.parseTrackName(t),this.node=s.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new s.Composite(e,t,i):new s(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(jx,"")}static parseTrackName(e){let t=sv.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let r=i.nodeName.substring(n+1);rv.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=i(o.children);if(l)return l}return null},n=i(e.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)e[t++]=i[n]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,n=t.propertyName,r=t.propertyIndex;if(e||(e=s.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){_e("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){Ue("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ue("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ue("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ue("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ue("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){Ue("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){Ue("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[n];if(a===void 0){let c=t.nodeName;Ue("PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(n==="morphTargetInfluences"){if(!e.geometry){Ue("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ue("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};_t.Composite=Qd;_t.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};_t.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};_t.prototype.GetterByBindingType=[_t.prototype._getValue_direct,_t.prototype._getValue_array,_t.prototype._getValue_arrayElement,_t.prototype._getValue_toArray];_t.prototype.SetterByBindingTypeAndVersioning=[[_t.prototype._setValue_direct,_t.prototype._setValue_direct_setNeedsUpdate,_t.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_array,_t.prototype._setValue_array_setNeedsUpdate,_t.prototype._setValue_array_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_arrayElement,_t.prototype._setValue_arrayElement_setNeedsUpdate,_t.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_fromArray,_t.prototype._setValue_fromArray_setNeedsUpdate,_t.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Hh=class{constructor(){this.isAnimationObjectGroup=!0,this.uuid=Ai(),this._objects=Array.prototype.slice.call(arguments),this.nCachedObjects_=0;let e={};this._indicesByUUID=e;for(let i=0,n=arguments.length;i!==n;++i)e[arguments[i].uuid]=i;this._paths=[],this._parsedPaths=[],this._bindings=[],this._bindingsIndicesByPath={};let t=this;this.stats={objects:{get total(){return t._objects.length},get inUse(){return this.total-t.nCachedObjects_}},get bindingsPerObject(){return t._bindings.length}}}add(){let e=this._objects,t=this._indicesByUUID,i=this._paths,n=this._parsedPaths,r=this._bindings,a=r.length,o,l=e.length,c=this.nCachedObjects_;for(let h=0,d=arguments.length;h!==d;++h){let u=arguments[h],f=u.uuid,p=t[f];if(p===void 0){p=l++,t[f]=p,e.push(u);for(let _=0,g=a;_!==g;++_)r[_].push(new _t(u,i[_],n[_]))}else if(p<c){o=e[p];let _=--c,g=e[_];t[g.uuid]=p,e[p]=g,t[f]=_,e[_]=u;for(let m=0,y=a;m!==y;++m){let w=r[m],v=w[_],b=w[p];w[p]=v,b===void 0&&(b=new _t(u,i[m],n[m])),w[_]=b}}else e[p]!==o&&Ue("AnimationObjectGroup: Different objects with the same UUID detected. Clean the caches or recreate your infrastructure when reloading scenes.")}this.nCachedObjects_=c}remove(){let e=this._objects,t=this._indicesByUUID,i=this._bindings,n=i.length,r=this.nCachedObjects_;for(let a=0,o=arguments.length;a!==o;++a){let l=arguments[a],c=l.uuid,h=t[c];if(h!==void 0&&h>=r){let d=r++,u=e[d];t[u.uuid]=h,e[h]=u,t[c]=d,e[d]=l;for(let f=0,p=n;f!==p;++f){let _=i[f],g=_[d],m=_[h];_[h]=g,_[d]=m}}}this.nCachedObjects_=r}uncache(){let e=this._objects,t=this._indicesByUUID,i=this._bindings,n=i.length,r=this.nCachedObjects_,a=e.length;for(let o=0,l=arguments.length;o!==l;++o){let c=arguments[o],h=c.uuid,d=t[h];if(d!==void 0)if(delete t[h],d<r){let u=--r,f=e[u],p=--a,_=e[p];d!==u&&(t[f.uuid]=d),e[d]=f,u!==p&&(t[_.uuid]=u),e[u]=_,e.pop();for(let g=0,m=n;g!==m;++g){let y=i[g],w=y[u],v=y[p];y[d]=w,y[u]=v,y.pop()}}else{let u=--a,f=e[u];d!==u&&(t[f.uuid]=d),e[d]=f,e.pop();for(let p=0,_=n;p!==_;++p){let g=i[p];g[d]=g[u],g.pop()}}}this.nCachedObjects_=r}subscribe_(e,t){let i=this._bindingsIndicesByPath,n=i[e],r=this._bindings;if(n!==void 0)return r[n];let a=this._paths,o=this._parsedPaths,l=this._objects,c=l.length,h=this.nCachedObjects_,d=new Array(c);n=r.length,i[e]=n,a.push(e),o.push(t),r.push(d);for(let u=h,f=l.length;u!==f;++u){let p=l[u];d[u]=new _t(p,e,t)}return d}unsubscribe_(e){let t=this._bindingsIndicesByPath,i=t[e];if(i!==void 0){let n=this._paths,r=this._parsedPaths,a=this._bindings,o=a.length-1,l=a[o],c=n[o];t[c]=i,a[i]=l,a.pop(),r[i]=r[o],r.pop(),n[i]=n[o],n.pop()}}},xl=class{constructor(e,t,i=null,n=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=i,this.blendMode=n;let r=t.tracks,a=r.length,o=new Array(a),l={endingStart:jn,endingEnd:jn};for(let c=0;c!==a;++c){let h=r[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=Cf,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,i=!1){if(e.fadeOut(t),this.fadeIn(t),i===!0){let n=this._clip.duration,r=e._clip.duration,a=r/n,o=n/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,i=!1){return e.crossFadeFrom(this,t,i)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,i){let n=this._mixer,r=n.time,a=this.timeScale,o=this._timeScaleInterpolant;o===null&&(o=n._lendControlInterpolant(),this._timeScaleInterpolant=o);let l=o.parameterPositions,c=o.sampleValues;return l[0]=r,l[1]=r+i,c[0]=e/a,c[1]=t/a,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,i,n){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let l=(e-r)*i;l<0||i===0?t=0:(this._startTime=null,t=i*l)}t*=this._updateTimeScale(e);let a=this._updateTime(t),o=this._updateWeight(e);if(o>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case Au:for(let h=0,d=l.length;h!==d;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);break;case nc:default:for(let h=0,d=l.length;h!==d;++h)l[h].evaluate(a),c[h].accumulate(n,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let i=this._weightInterpolant;if(i!==null){let n=i.evaluate(e)[0];t*=n,e>i.parameterPositions[1]&&(this.stopFading(),n===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let i=this._timeScaleInterpolant;if(i!==null){let n=i.evaluate(e)[0];t*=n,e>i.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,i=this.loop,n=this.time+e,r=this._loopCount,a=i===Rf;if(e===0)return r===-1?n:a&&(r&1)===1?t-n:n;if(i===Af){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(n>=t)n=t;else if(n<0)n=0;else{this.time=n;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=n,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),n>=t||n<0){let o=Math.floor(n/t);n-=t*o,r+=Math.abs(o);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,n=e>0?t:0,this.time=n,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=n,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this._loopCount=r,this.time=n;if(a&&(r&1)===1)return t-n}return n}_setEndings(e,t,i){let n=this._interpolantSettings;i?(n.endingStart=Qn,n.endingEnd=Qn):(e?n.endingStart=this.zeroSlopeAtStart?Qn:jn:n.endingStart=kr,t?n.endingEnd=this.zeroSlopeAtEnd?Qn:jn:n.endingEnd=kr)}_scheduleFading(e,t,i){let n=this._mixer,r=n.time,a=this._weightInterpolant;a===null&&(a=n._lendControlInterpolant(),this._weightInterpolant=a);let o=a.parameterPositions,l=a.sampleValues;return o[0]=r,l[0]=t,o[1]=r+e,l[1]=i,this}},av=new Float32Array(1),Wh=class extends ai{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){let i=e._localRoot||this._root,n=e._clip.tracks,r=n.length,a=e._propertyBindings,o=e._interpolants,l=i.uuid,c=this._bindingsByRootAndName,h=c[l];h===void 0&&(h={},c[l]=h);for(let d=0;d!==r;++d){let u=n[d],f=u.name,p=h[f];if(p!==void 0)++p.referenceCount,a[d]=p;else{if(p=a[d],p!==void 0){p._cacheIndex===null&&(++p.referenceCount,this._addInactiveBinding(p,l,f));continue}let _=t&&t._propertyBindings[d].binding.parsedPath;p=new _l(_t.create(i,f,_),u.ValueTypeName,u.getValueSize()),++p.referenceCount,this._addInactiveBinding(p,l,f),a[d]=p}o[d].resultBuffer=p.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let i=(e._localRoot||this._root).uuid,n=e._clip.uuid,r=this._actionsByClip[n];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,n,i)}let t=e._propertyBindings;for(let i=0,n=t.length;i!==n;++i){let r=t[i];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let i=0,n=t.length;i!==n;++i){let r=t[i];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,i){let n=this._actions,r=this._actionsByClip,a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{let o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=n.length,n.push(e),a.actionByRoot[i]=e}_removeInactiveAction(e){let t=this._actions,i=t[t.length-1],n=e._cacheIndex;i._cacheIndex=n,t[n]=i,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,a=this._actionsByClip,o=a[r],l=o.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;let d=o.actionByRoot,u=(e._localRoot||this._root).uuid;delete d[u],l.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let i=0,n=t.length;i!==n;++i){let r=t[i];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,i=e._cacheIndex,n=this._nActiveActions++,r=t[n];e._cacheIndex=n,t[n]=e,r._cacheIndex=i,t[i]=r}_takeBackAction(e){let t=this._actions,i=e._cacheIndex,n=--this._nActiveActions,r=t[n];e._cacheIndex=n,t[n]=e,r._cacheIndex=i,t[i]=r}_addInactiveBinding(e,t,i){let n=this._bindingsByRootAndName,r=this._bindings,a=n[t];a===void 0&&(a={},n[t]=a),a[i]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,i=e.binding,n=i.rootNode.uuid,r=i.path,a=this._bindingsByRootAndName,o=a[n],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[n]}_lendBinding(e){let t=this._bindings,i=e._cacheIndex,n=this._nActiveBindings++,r=t[n];e._cacheIndex=n,t[n]=e,r._cacheIndex=i,t[i]=r}_takeBackBinding(e){let t=this._bindings,i=e._cacheIndex,n=--this._nActiveBindings,r=t[n];e._cacheIndex=n,t[n]=e,r._cacheIndex=i,t[i]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,i=e[t];return i===void 0&&(i=new oa(new Float32Array(2),new Float32Array(2),1,av),i.__cacheIndex=t,e[t]=i),i}_takeBackControlInterpolant(e){let t=this._controlInterpolants,i=e.__cacheIndex,n=--this._nActiveControlInterpolants,r=t[n];e.__cacheIndex=n,t[n]=e,r.__cacheIndex=i,t[i]=r}clipAction(e,t,i){let n=t||this._root,r=n.uuid,a=typeof e=="string"?ls.findByName(n,e):e,o=a!==null?a.uuid:e,l=this._actionsByClip[o],c=null;if(i===void 0&&(a!==null?i=a.blendMode:i=nc),l!==void 0){let d=l.actionByRoot[r];if(d!==void 0&&d.blendMode===i)return d;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;let h=new xl(this,a,t,i);return this._bindAction(h,c),this._addInactiveAction(h,o,r),h}existingAction(e,t){let i=t||this._root,n=i.uuid,r=typeof e=="string"?ls.findByName(i,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[n]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let i=t-1;i>=0;--i)e[i].stop();return this}update(e){e*=this.timeScale;let t=this._actions,i=this._nActiveActions,n=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==i;++c)t[c]._update(n,e,r,a);let o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,i=e.uuid,n=this._actionsByClip,r=n[i];if(r!==void 0){let a=r.knownActions;for(let o=0,l=a.length;o!==l;++o){let c=a[o];this._deactivateAction(c);let h=c._cacheIndex,d=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,d._cacheIndex=h,t[h]=d,t.pop(),this._removeInactiveBindingsForAction(c)}delete n[i]}}uncacheRoot(e){let t=e.uuid,i=this._actionsByClip;for(let a in i){let o=i[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let n=this._bindingsByRootAndName,r=n[t];if(r!==void 0)for(let a in r){let o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){let i=this.existingAction(e,t);i!==null&&(this._deactivateAction(i),this._removeInactiveAction(i))}},Xh=class extends Xr{constructor(e=1,t=1,i=1,n={}){super(e,t,n),this.isRenderTarget3D=!0,this.depth=i;for(let r=0;r<this.textures.length;r++){let a=new Us(null,e,t,i);a.isRenderTargetTexture=!0,a.renderTarget=this,this.textures[r]=a}this._setTextureOptions(n)}},qh=class s{constructor(e){this.value=e}clone(){return new s(this.value.clone===void 0?this.value:this.value.clone())}},ov=0,Yh=class extends ai{constructor(){super(),this.isUniformsGroup=!0,Object.defineProperty(this,"id",{value:ov++}),this.name="",this.usage=ac,this.uniforms=[]}add(e){return this.uniforms.push(e),this}remove(e){let t=this.uniforms.indexOf(e);return t!==-1&&this.uniforms.splice(t,1),this}setName(e){return this.name=e,this}setUsage(e){return this.usage=e,this}dispose(){this.dispatchEvent({type:"dispose"})}copy(e){this.name=e.name,this.usage=e.usage;let t=e.uniforms;this.uniforms.length=0;for(let i=0,n=t.length;i<n;i++){let r=Array.isArray(t[i])?t[i]:[t[i]];for(let a=0;a<r.length;a++)this.uniforms.push(r[a].clone())}return this}clone(){return new this.constructor().copy(this)}},Zh=class extends zs{constructor(e,t,i=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}},Kh=class{constructor(e,t,i,n,r,a=!1){this.isGLBufferAttribute=!0,this.name="",this.buffer=e,this.type=t,this.itemSize=i,this.elementSize=n,this.count=r,this.normalized=a,this.version=0}set needsUpdate(e){e===!0&&this.version++}setBuffer(e){return this.buffer=e,this}setType(e,t){return this.type=e,this.elementSize=t,this}setItemSize(e){return this.itemSize=e,this}setCount(e){return this.count=e,this}},Om=new qe,pa=class{constructor(e,t,i=0,n=1/0){this.ray=new nn(e,t),this.near=i,this.far=n,this.camera=null,this.layers=new Fs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ue("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Om.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Om),this}intersectObject(e,t=!0,i=[]){return ef(e,this,i,t),i.sort(Bm),i}intersectObjects(e,t=!0,i=[]){for(let n=0,r=e.length;n<r;n++)ef(e[n],this,i,t);return i.sort(Bm),i}};function Bm(s,e){return s.distance-e.distance}function ef(s,e,t,i){let n=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(n=!1),n===!0&&i===!0){let r=s.children;for(let a=0,o=r.length;a<o;a++)ef(r[a],e,t,!0)}}var Jh=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,_e("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}},er=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Ze(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(Ze(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}},$h=class{constructor(e=1,t=0,i=0){this.radius=e,this.theta=t,this.y=i}set(e,t,i){return this.radius=e,this.theta=t,this.y=i,this}copy(e){return this.radius=e.radius,this.theta=e.theta,this.y=e.y,this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+i*i),this.theta=Math.atan2(e,i),this.y=t,this}clone(){return new this.constructor().copy(this)}},jh=class s{static{s.prototype.isMatrix2=!0}constructor(e,t,i,n){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,n){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=n,this}},zm=new Z,vl=class{constructor(e=new Z(1/0,1/0),t=new Z(-1/0,-1/0)){this.isBox2=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=zm.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=1/0,this.max.x=this.max.y=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y}getCenter(e){return this.isEmpty()?e.set(0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,zm).distanceTo(e)}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},km=new C,sh=new C,Lr=new C,Nr=new C,kd=new C,lv=new C,cv=new C,Qh=class{constructor(e=new C,t=new C){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){km.subVectors(e,this.start),sh.subVectors(this.end,this.start);let i=sh.dot(sh);if(i===0)return 0;let r=sh.dot(km)/i;return t&&(r=Ze(r,0,1)),r}closestPointToPoint(e,t,i){let n=this.closestPointToPointParameter(e,t);return this.delta(i).multiplyScalar(n).add(this.start)}distanceSqToLine3(e,t=lv,i=cv){let n=10000000000000001e-32,r,a,o=this.start,l=e.start,c=this.end,h=e.end;Lr.subVectors(c,o),Nr.subVectors(h,l),kd.subVectors(o,l);let d=Lr.dot(Lr),u=Nr.dot(Nr),f=Nr.dot(kd);if(d<=n&&u<=n)return t.copy(o),i.copy(l),t.sub(i),t.dot(t);if(d<=n)r=0,a=f/u,a=Ze(a,0,1);else{let p=Lr.dot(kd);if(u<=n)a=0,r=Ze(-p/d,0,1);else{let _=Lr.dot(Nr),g=d*u-_*_;g!==0?r=Ze((_*f-p*u)/g,0,1):r=0,a=(_*r+f)/u,a<0?(a=0,r=Ze(-p/d,0,1)):a>1&&(a=1,r=Ze((_-p)/d,0,1))}}return t.copy(o).addScaledVector(Lr,r),i.copy(l).addScaledVector(Nr,a),t.distanceToSquared(i)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}},Vm=new C,eu=class extends ct{constructor(e,t){super(),this.light=e,this.matrixAutoUpdate=!1,this.color=t,this.type="SpotLightHelper";let i=new Ye,n=[0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,-1,0,1,0,0,0,0,1,1,0,0,0,0,-1,1];for(let a=0,o=1,l=32;a<l;a++,o++){let c=a/l*Math.PI*2,h=o/l*Math.PI*2;n.push(Math.cos(c),Math.sin(c),1,Math.cos(h),Math.sin(h),1)}i.setAttribute("position",new Te(n,3));let r=new Kt({fog:!1,toneMapped:!1});this.cone=new Ci(i,r),this.add(this.cone),this.update()}dispose(){super.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}update(){this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),this.parent?(this.parent.updateWorldMatrix(!0),this.matrix.copy(this.parent.matrixWorld).invert().multiply(this.light.matrixWorld)):this.matrix.copy(this.light.matrixWorld),this.matrixWorldNeedsUpdate=!0;let e=this.light.distance?this.light.distance:1e3,t=e*Math.tan(this.light.angle);this.cone.scale.set(t,t,e),Vm.setFromMatrixPosition(this.light.target.matrixWorld),this.cone.lookAt(Vm),this.color!==void 0?this.cone.material.color.set(this.color):this.cone.material.color.copy(this.light.color)}},$n=new C,rh=new qe,Vd=new qe,tu=class extends Ci{constructor(e){let t=jg(e),i=new Ye,n=[],r=[];for(let c=0;c<t.length;c++){let h=t[c];h.parent&&h.parent.isBone&&(n.push(0,0,0),n.push(0,0,0),r.push(0,0,0),r.push(0,0,0))}i.setAttribute("position",new Te(n,3)),i.setAttribute("color",new Te(r,3));let a=new Kt({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0});super(i,a),this.isSkeletonHelper=!0,this.type="SkeletonHelper",this.root=e,this.bones=t,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1;let o=new ae(255),l=new ae(65280);this.setColors(o,l)}updateMatrixWorld(e){let t=this.bones,i=this.geometry,n=i.getAttribute("position");Vd.copy(this.root.matrixWorld).invert();for(let r=0,a=0;r<t.length;r++){let o=t[r];o.parent&&o.parent.isBone&&(rh.multiplyMatrices(Vd,o.matrixWorld),$n.setFromMatrixPosition(rh),n.setXYZ(a,$n.x,$n.y,$n.z),rh.multiplyMatrices(Vd,o.parent.matrixWorld),$n.setFromMatrixPosition(rh),n.setXYZ(a+1,$n.x,$n.y,$n.z),a+=2)}i.getAttribute("position").needsUpdate=!0,super.updateMatrixWorld(e)}setColors(e,t){let n=this.geometry.getAttribute("color");for(let r=0;r<n.count;r+=2)n.setXYZ(r,e.r,e.g,e.b),n.setXYZ(r+1,t.r,t.g,t.b);return n.needsUpdate=!0,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};function jg(s){let e=[];s.isBone===!0&&e.push(s);for(let t=0;t<s.children.length;t++)e.push(...jg(s.children[t]));return e}var iu=class extends st{constructor(e,t,i){let n=new sa(t,4,2),r=new dt({wireframe:!0,fog:!1,toneMapped:!1});super(n,r),this.light=e,this.color=i,this.type="PointLightHelper",this.matrix=this.light.matrixWorld,this.matrixAutoUpdate=!1,this.update()}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}update(){this.matrixWorldNeedsUpdate=!0,this.light.updateWorldMatrix(!0,!1),this.color!==void 0?this.material.color.set(this.color):this.material.color.copy(this.light.color)}},hv=new C,Gm=new ae,Hm=new ae,nu=class extends ct{constructor(e,t,i){super(),this.light=e,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=i,this.type="HemisphereLightHelper";let n=new ki(t);n.rotateY(Math.PI*.5),this.material=new dt({wireframe:!0,fog:!1,toneMapped:!1}),this.color===void 0&&(this.material.vertexColors=!0);let r=n.getAttribute("position"),a=new Float32Array(r.count*3);n.setAttribute("color",new ft(a,3)),this.add(new st(n,this.material)),this.update()}dispose(){super.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()}update(){let e=this.children[0];if(this.color!==void 0)this.material.color.set(this.color);else{let t=e.geometry.getAttribute("color");Gm.copy(this.light.color),Hm.copy(this.light.groundColor);for(let i=0,n=t.count;i<n;i++){let r=i<n/2?Gm:Hm;t.setXYZ(i,r.r,r.g,r.b)}t.needsUpdate=!0}this.matrixWorldNeedsUpdate=!0,this.light.updateWorldMatrix(!0,!1),e.lookAt(hv.setFromMatrixPosition(this.light.matrixWorld).negate())}},su=class extends Ci{constructor(e=10,t=10,i=4473924,n=8947848){i=new ae(i),n=new ae(n);let r=t/2,a=e/t,o=e/2,l=[],c=[];for(let u=0,f=0,p=-o;u<=t;u++,p+=a){l.push(-o,0,p,o,0,p),l.push(p,0,-o,p,0,o);let _=u===r?i:n;_.toArray(c,f),f+=3,_.toArray(c,f),f+=3,_.toArray(c,f),f+=3,_.toArray(c,f),f+=3}let h=new Ye;h.setAttribute("position",new Te(l,3)),h.setAttribute("color",new Te(c,3));let d=new Kt({vertexColors:!0,toneMapped:!1});super(h,d),this.type="GridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},ru=class extends Ci{constructor(e=10,t=16,i=8,n=64,r=4473924,a=8947848){r=new ae(r),a=new ae(a);let o=[],l=[];if(t>1)for(let d=0;d<t;d++){let u=d/t*(Math.PI*2),f=Math.sin(u)*e,p=Math.cos(u)*e;o.push(0,0,0),o.push(f,0,p);let _=d&1?r:a;l.push(_.r,_.g,_.b),l.push(_.r,_.g,_.b)}for(let d=0;d<i;d++){let u=d&1?r:a,f=e-e/i*d;for(let p=0;p<n;p++){let _=p/n*(Math.PI*2),g=Math.sin(_)*f,m=Math.cos(_)*f;o.push(g,0,m),l.push(u.r,u.g,u.b),_=(p+1)/n*(Math.PI*2),g=Math.sin(_)*f,m=Math.cos(_)*f,o.push(g,0,m),l.push(u.r,u.g,u.b)}}let c=new Ye;c.setAttribute("position",new Te(o,3)),c.setAttribute("color",new Te(l,3));let h=new Kt({vertexColors:!0,toneMapped:!1});super(c,h),this.type="PolarGridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},Wm=new C,ah=new C,Xm=new C,au=class extends ct{constructor(e,t,i){super(),this.light=e,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=i,this.type="DirectionalLightHelper",t===void 0&&(t=1);let n=new Ye;n.setAttribute("position",new Te([-t,t,0,t,t,0,t,-t,0,-t,-t,0,-t,t,0],3));let r=new Kt({fog:!1,toneMapped:!1});this.lightPlane=new sn(n,r),this.add(this.lightPlane),n=new Ye,n.setAttribute("position",new Te([0,0,0,0,0,1],3)),this.targetLine=new sn(n,r),this.add(this.targetLine),this.update()}dispose(){super.dispose(),this.lightPlane.geometry.dispose(),this.lightPlane.material.dispose(),this.targetLine.geometry.dispose(),this.targetLine.material.dispose()}update(){this.matrixWorldNeedsUpdate=!0,this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),Wm.setFromMatrixPosition(this.light.matrixWorld),ah.setFromMatrixPosition(this.light.target.matrixWorld),Xm.subVectors(ah,Wm),this.lightPlane.lookAt(ah),this.color!==void 0?(this.lightPlane.material.color.set(this.color),this.targetLine.material.color.set(this.color)):(this.lightPlane.material.color.copy(this.light.color),this.targetLine.material.color.copy(this.light.color)),this.targetLine.lookAt(ah),this.targetLine.scale.z=Xm.length()}},oh=new C,It=new Js,ou=class extends Ci{constructor(e){let t=new Ye,i=new Kt({color:16777215,vertexColors:!0,toneMapped:!1}),n=[],r=[],a={};o("n1","n2"),o("n2","n4"),o("n4","n3"),o("n3","n1"),o("f1","f2"),o("f2","f4"),o("f4","f3"),o("f3","f1"),o("n1","f1"),o("n2","f2"),o("n3","f3"),o("n4","f4"),o("p","n1"),o("p","n2"),o("p","n3"),o("p","n4"),o("u1","u2"),o("u2","u3"),o("u3","u1"),o("c","t"),o("p","c"),o("cn1","cn2"),o("cn3","cn4"),o("cf1","cf2"),o("cf3","cf4");function o(p,_){l(p),l(_)}function l(p){n.push(0,0,0),r.push(0,0,0),a[p]===void 0&&(a[p]=[]),a[p].push(n.length/3-1)}t.setAttribute("position",new Te(n,3)),t.setAttribute("color",new Te(r,3)),super(t,i),this.type="CameraHelper",this.camera=e,this.camera.updateProjectionMatrix&&this.camera.updateProjectionMatrix(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=a,this.update();let c=new ae(16755200),h=new ae(16711680),d=new ae(43775),u=new ae(16777215),f=new ae(3355443);this.setColors(c,h,d,u,f)}setColors(e,t,i,n,r){let o=this.geometry.getAttribute("color");return o.setXYZ(0,e.r,e.g,e.b),o.setXYZ(1,e.r,e.g,e.b),o.setXYZ(2,e.r,e.g,e.b),o.setXYZ(3,e.r,e.g,e.b),o.setXYZ(4,e.r,e.g,e.b),o.setXYZ(5,e.r,e.g,e.b),o.setXYZ(6,e.r,e.g,e.b),o.setXYZ(7,e.r,e.g,e.b),o.setXYZ(8,e.r,e.g,e.b),o.setXYZ(9,e.r,e.g,e.b),o.setXYZ(10,e.r,e.g,e.b),o.setXYZ(11,e.r,e.g,e.b),o.setXYZ(12,e.r,e.g,e.b),o.setXYZ(13,e.r,e.g,e.b),o.setXYZ(14,e.r,e.g,e.b),o.setXYZ(15,e.r,e.g,e.b),o.setXYZ(16,e.r,e.g,e.b),o.setXYZ(17,e.r,e.g,e.b),o.setXYZ(18,e.r,e.g,e.b),o.setXYZ(19,e.r,e.g,e.b),o.setXYZ(20,e.r,e.g,e.b),o.setXYZ(21,e.r,e.g,e.b),o.setXYZ(22,e.r,e.g,e.b),o.setXYZ(23,e.r,e.g,e.b),o.setXYZ(24,t.r,t.g,t.b),o.setXYZ(25,t.r,t.g,t.b),o.setXYZ(26,t.r,t.g,t.b),o.setXYZ(27,t.r,t.g,t.b),o.setXYZ(28,t.r,t.g,t.b),o.setXYZ(29,t.r,t.g,t.b),o.setXYZ(30,t.r,t.g,t.b),o.setXYZ(31,t.r,t.g,t.b),o.setXYZ(32,i.r,i.g,i.b),o.setXYZ(33,i.r,i.g,i.b),o.setXYZ(34,i.r,i.g,i.b),o.setXYZ(35,i.r,i.g,i.b),o.setXYZ(36,i.r,i.g,i.b),o.setXYZ(37,i.r,i.g,i.b),o.setXYZ(38,n.r,n.g,n.b),o.setXYZ(39,n.r,n.g,n.b),o.setXYZ(40,r.r,r.g,r.b),o.setXYZ(41,r.r,r.g,r.b),o.setXYZ(42,r.r,r.g,r.b),o.setXYZ(43,r.r,r.g,r.b),o.setXYZ(44,r.r,r.g,r.b),o.setXYZ(45,r.r,r.g,r.b),o.setXYZ(46,r.r,r.g,r.b),o.setXYZ(47,r.r,r.g,r.b),o.setXYZ(48,r.r,r.g,r.b),o.setXYZ(49,r.r,r.g,r.b),o.needsUpdate=!0,this}update(){let e=this.geometry,t=this.pointMap,i=1,n=1,r,a;if(It.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),this.camera.reversedDepth===!0)r=1,a=0;else if(this.camera.coordinateSystem===yi)r=-1,a=1;else if(this.camera.coordinateSystem===es)r=0,a=1;else throw new Error("THREE.CameraHelper.update(): Invalid coordinate system: "+this.camera.coordinateSystem);Ft("c",t,e,It,0,0,r),Ft("t",t,e,It,0,0,a),Ft("n1",t,e,It,-i,-n,r),Ft("n2",t,e,It,i,-n,r),Ft("n3",t,e,It,-i,n,r),Ft("n4",t,e,It,i,n,r),Ft("f1",t,e,It,-i,-n,a),Ft("f2",t,e,It,i,-n,a),Ft("f3",t,e,It,-i,n,a),Ft("f4",t,e,It,i,n,a),Ft("u1",t,e,It,i*.7,n*1.1,r),Ft("u2",t,e,It,-i*.7,n*1.1,r),Ft("u3",t,e,It,0,n*2,r),Ft("cf1",t,e,It,-i,0,a),Ft("cf2",t,e,It,i,0,a),Ft("cf3",t,e,It,0,-n,a),Ft("cf4",t,e,It,0,n,a),Ft("cn1",t,e,It,-i,0,r),Ft("cn2",t,e,It,i,0,r),Ft("cn3",t,e,It,0,-n,r),Ft("cn4",t,e,It,0,n,r),e.getAttribute("position").needsUpdate=!0}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};function Ft(s,e,t,i,n,r,a){oh.set(n,r,a).unproject(i);let o=e[s];if(o!==void 0){let l=t.getAttribute("position");for(let c=0,h=o.length;c<h;c++)l.setXYZ(o[c],oh.x,oh.y,oh.z)}}var lh=new Wt,lu=class extends Ci{constructor(e,t=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),n=new Float32Array(24),r=new Ye;r.setIndex(new ft(i,1)),r.setAttribute("position",new ft(n,3)),super(r,new Kt({color:t,toneMapped:!1})),this.object=e,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(){if(this.object!==void 0&&lh.setFromObject(this.object),lh.isEmpty())return;let e=lh.min,t=lh.max,i=this.geometry.attributes.position,n=i.array;n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=e.x,n[4]=t.y,n[5]=t.z,n[6]=e.x,n[7]=e.y,n[8]=t.z,n[9]=t.x,n[10]=e.y,n[11]=t.z,n[12]=t.x,n[13]=t.y,n[14]=e.z,n[15]=e.x,n[16]=t.y,n[17]=e.z,n[18]=e.x,n[19]=e.y,n[20]=e.z,n[21]=t.x,n[22]=e.y,n[23]=e.z,i.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}copy(e,t){return super.copy(e,t),this.object=e.object,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},cu=class extends Ci{constructor(e,t=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),n=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],r=new Ye;r.setIndex(new ft(i,1)),r.setAttribute("position",new Te(n,3)),super(r,new Kt({color:t,toneMapped:!1})),this.box=e,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(e){let t=this.box;t.isEmpty()||(t.getCenter(this.position),t.getSize(this.scale),this.scale.multiplyScalar(.5),super.updateMatrixWorld(e))}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},hu=class extends sn{constructor(e,t=1,i=16776960){let n=i,r=[1,-1,0,-1,1,0,-1,-1,0,1,1,0,-1,1,0,-1,-1,0,1,-1,0,1,1,0],a=new Ye;a.setAttribute("position",new Te(r,3)),a.computeBoundingSphere(),super(a,new Kt({color:n,toneMapped:!1})),this.type="PlaneHelper",this.plane=e,this.size=t;let o=[1,1,0,-1,1,0,-1,-1,0,1,1,0,-1,-1,0,1,-1,0],l=new Ye;l.setAttribute("position",new Te(o,3)),l.computeBoundingSphere(),this.add(new st(l,new dt({color:n,opacity:.2,transparent:!0,depthWrite:!1,toneMapped:!1})))}updateMatrixWorld(e){this.position.set(0,0,0),this.scale.set(.5*this.size,.5*this.size,1),this.lookAt(this.plane.normal),this.translateZ(-this.plane.constant),super.updateMatrixWorld(e)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()}},qm=new C,ch,Gd,uu=class extends ct{constructor(e=new C(0,0,1),t=new C(0,0,0),i=1,n=16776960,r=i*.2,a=r*.2){super(),this.type="ArrowHelper",ch===void 0&&(ch=new Ye,ch.setAttribute("position",new Te([0,0,0,0,1,0],3)),Gd=new $r(.5,1,5,1),Gd.translate(0,-.5,0)),this.position.copy(t),this.line=new sn(ch,new Kt({color:n,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new st(Gd,new dt({color:n,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(i,r,a)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{qm.set(e.z,0,-e.x).normalize();let t=Math.acos(e.y);this.quaternion.setFromAxisAngle(qm,t)}}setLength(e,t=e*.2,i=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(i,t,i),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){super.dispose(),this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}},du=class extends Ci{constructor(e=1){let t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],i=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],n=new Ye;n.setAttribute("position",new Te(t,3)),n.setAttribute("color",new Te(i,3));let r=new Kt({vertexColors:!0,toneMapped:!1});super(n,r),this.type="AxesHelper"}setColors(e,t,i){let n=new ae,r=this.geometry.attributes.color.array;return n.set(e),n.toArray(r,0),n.toArray(r,3),n.set(t),n.toArray(r,6),n.toArray(r,9),n.set(i),n.toArray(r,12),n.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},fu=class{constructor(){this.type="ShapePath",this.color=new ae,this.subPaths=[],this.currentPath=null,this.userData={}}moveTo(e,t){return this.currentPath=new gn,this.subPaths.push(this.currentPath),this.currentPath.moveTo(e,t),this}lineTo(e,t){return this.currentPath.lineTo(e,t),this}quadraticCurveTo(e,t,i,n){return this.currentPath.quadraticCurveTo(e,t,i,n),this}bezierCurveTo(e,t,i,n,r,a){return this.currentPath.bezierCurveTo(e,t,i,n,r,a),this}splineThru(e){return this.currentPath.splineThru(e),this}toShapes(){function e(l,c){let h=!1,d=c.length;for(let u=0,f=d-1;u<d;f=u++){let p=c[u],_=c[f];p.y>l.y!=_.y>l.y&&l.x<(_.x-p.x)*(l.y-p.y)/(_.y-p.y)+p.x&&(h=!h)}return h}function t(l,c){let h=c.getCenter(new Z);if(e(h,l))return h;let d=h.y,u=[],f=l.length;for(let p=0;p<f;p++){let _=l[p],g=l[(p+1)%f];if(_.y>d!=g.y>d){let m=_.x+(d-_.y)*(g.x-_.x)/(g.y-_.y);u.push(m)}}return u.length>1&&(u.sort((p,_)=>p-_),h.x=(u[0]+u[1])/2),h}let i=this.userData.style&&this.userData.style.fillRule||"nonzero";i!=="nonzero"&&i!=="evenodd"&&(_e('Fill-rule "'+i+'" is not supported, falling back to "nonzero".'),i="nonzero");let n=i==="nonzero"?(l=>l!==0):(l=>(l&1)!==0),r=[];for(let l of this.subPaths){let c=l.getPoints();if(c.length<3)continue;let h=Fi.area(c);if(h===0)continue;let d=new vl;for(let u=0;u<c.length;u++)d.expandByPoint(c[u]);r.push({subPath:l,points:c,boundingBox:d,interiorPoint:t(c,d),absArea:Math.abs(h),winding:h<0?-1:1,container:null,exclude:!1,role:null})}r.sort((l,c)=>c.absArea-l.absArea);for(let l=0;l<r.length;l++){let c=r[l],h=0;for(let d=l-1;d>=0;d--){let u=r[d];if(u.boundingBox.containsBox(c.boundingBox)&&e(c.interiorPoint,u.points)){c.container=u.exclude?u.container:u,h=u.winding,c.winding+=h;break}}n(c.winding)===n(h)&&(c.exclude=!0)}for(let l of r)l.exclude||(l.role=l.container===null||l.container.role==="hole"?"outer":"hole");let a=[],o=new Map;for(let l of r){if(l.exclude||l.role!=="outer")continue;let c=new zi;c.curves=l.subPath.curves,a.push(c),o.set(l,c)}for(let l of r){if(l.exclude||l.role!=="hole")continue;let c=o.get(l.container);if(!c)continue;let h=new gn;h.curves=l.subPath.curves,c.holes.push(h)}return a}},ma=class extends ai{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function uv(s,e){let t=s.image&&s.image.width?s.image.width/s.image.height:1;return t>e?(s.repeat.x=1,s.repeat.y=t/e,s.offset.x=0,s.offset.y=(1-s.repeat.y)/2):(s.repeat.x=e/t,s.repeat.y=1,s.offset.x=(1-s.repeat.x)/2,s.offset.y=0),s}function dv(s,e){let t=s.image&&s.image.width?s.image.width/s.image.height:1;return t>e?(s.repeat.x=e/t,s.repeat.y=1,s.offset.x=(1-s.repeat.x)/2,s.offset.y=0):(s.repeat.x=1,s.repeat.y=t/e,s.offset.x=0,s.offset.y=(1-s.repeat.y)/2),s}function fv(s){return s.repeat.x=1,s.repeat.y=1,s.offset.x=0,s.offset.y=0,s}function Ru(s,e,t,i){let n=pv(i);switch(t){case Tu:return s*e;case wl:return s*e/n.components*n.byteLength;case Aa:return s*e/n.components*n.byteLength;case Gn:return s*e*2/n.components*n.byteLength;case Tl:return s*e*2/n.components*n.byteLength;case Eu:return s*e*3/n.components*n.byteLength;case ri:return s*e*4/n.components*n.byteLength;case El:return s*e*4/n.components*n.byteLength;case Ca:case Ra:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Pa:case Ia:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Cl:case Pl:return Math.max(s,16)*Math.max(e,8)/4;case Al:case Rl:return Math.max(s,8)*Math.max(e,8)/2;case Il:case Dl:case Nl:case Ul:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Ll:case Da:case Fl:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ol:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Bl:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case zl:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case kl:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Vl:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Gl:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Hl:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Wl:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Xl:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case ql:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Yl:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Zl:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Kl:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Jl:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case $l:case jl:case Ql:return Math.ceil(s/4)*Math.ceil(e/4)*16;case ec:case tc:return Math.ceil(s/4)*Math.ceil(e/4)*8;case La:case ic:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function pv(s){switch(s){case gi:case Mu:return{byteLength:1,components:1};case rr:case bu:case Jt:return{byteLength:2,components:1};case bl:case Sl:return{byteLength:2,components:4};case Ii:case Ml:case si:return{byteLength:4,components:1};case Su:case wu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}var pu=class{static contain(e,t){return uv(e,t)}static cover(e,t){return dv(e,t)}static fill(e){return fv(e)}static getByteLength(e,t,i,n){return Ru(e,t,i,n)}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?_e("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function y0(){let s=null,e=!1,t=null,i=null;function n(r,a){i=s.requestAnimationFrame(n),t(r,a)}return{start:function(){e!==!0&&t!==null&&s!==null&&(i=s.requestAnimationFrame(n),e=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function mv(s){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=s.createBuffer();s.bindBuffer(l,u),s.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){let h=l.array,d=l.updateRanges;if(s.bindBuffer(c,o),d.length===0)s.bufferSubData(c,0,h);else{d.sort((f,p)=>f.start-p.start);let u=0;for(let f=1;f<d.length;f++){let p=d[u],_=d[f];_.start<=p.start+p.count+1?p.count=Math.max(p.count,_.start+_.count-p.start):(++u,d[u]=_)}d.length=u+1;for(let f=0,p=d.length;f<p;f++){let _=d[f];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(s.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:n,remove:r,update:a}}var gv=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,_v=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,xv=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,vv=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,yv=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Mv=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,bv=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Sv=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,wv=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Tv=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ev=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Av=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Cv=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Rv=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Pv=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Iv=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Dv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Lv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Nv=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Uv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Fv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Ov=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Bv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,zv=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,kv=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Vv=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Gv=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Hv=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Wv=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Xv=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,qv="gl_FragColor = linearToOutputTexel( gl_FragColor );",Yv=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Zv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Kv=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Jv=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,$v=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,jv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Qv=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ey=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ty=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,iy=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ny=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,sy=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ry=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ay=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,oy=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,ly=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,cy=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,hy=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,uy=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,dy=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,fy=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,py=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,my=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,gy=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,_y=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,xy=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,vy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,yy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,My=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,by=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Sy=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,wy=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ty=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Ey=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ay=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Cy=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ry=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Py=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Iy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Dy=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ly=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ny=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Uy=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Fy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Oy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,By=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,zy=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,ky=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Vy=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Gy=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Hy=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Wy=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Xy=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,qy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Yy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Zy=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ky=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Jy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,$y=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,jy=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Qy=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,eM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,tM=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,iM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,nM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,sM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,rM=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,aM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,oM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,lM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,cM=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,hM=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,uM=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,dM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,fM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,pM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,mM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,gM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,_M=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vM=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,MM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,SM=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,wM=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,TM=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,EM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,AM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,CM=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,RM=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,PM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,IM=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,DM=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,LM=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,NM=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,UM=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,FM=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,OM=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,BM=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zM=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kM=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,VM=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,GM=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,HM=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,WM=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,XM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,qM=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,YM=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ZM=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,KM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,tt={alphahash_fragment:gv,alphahash_pars_fragment:_v,alphamap_fragment:xv,alphamap_pars_fragment:vv,alphatest_fragment:yv,alphatest_pars_fragment:Mv,aomap_fragment:bv,aomap_pars_fragment:Sv,batching_pars_vertex:wv,batching_vertex:Tv,begin_vertex:Ev,beginnormal_vertex:Av,bsdfs:Cv,iridescence_fragment:Rv,bumpmap_pars_fragment:Pv,clipping_planes_fragment:Iv,clipping_planes_pars_fragment:Dv,clipping_planes_pars_vertex:Lv,clipping_planes_vertex:Nv,color_fragment:Uv,color_pars_fragment:Fv,color_pars_vertex:Ov,color_vertex:Bv,common:zv,cube_uv_reflection_fragment:kv,defaultnormal_vertex:Vv,displacementmap_pars_vertex:Gv,displacementmap_vertex:Hv,emissivemap_fragment:Wv,emissivemap_pars_fragment:Xv,colorspace_fragment:qv,colorspace_pars_fragment:Yv,envmap_fragment:Zv,envmap_common_pars_fragment:Kv,envmap_pars_fragment:Jv,envmap_pars_vertex:$v,envmap_physical_pars_fragment:ly,envmap_vertex:jv,fog_vertex:Qv,fog_pars_vertex:ey,fog_fragment:ty,fog_pars_fragment:iy,gradientmap_pars_fragment:ny,lightmap_pars_fragment:sy,lights_lambert_fragment:ry,lights_lambert_pars_fragment:ay,lights_pars_begin:oy,lights_toon_fragment:cy,lights_toon_pars_fragment:hy,lights_phong_fragment:uy,lights_phong_pars_fragment:dy,lights_physical_fragment:fy,lights_physical_pars_fragment:py,lights_fragment_begin:my,lights_fragment_maps:gy,lights_fragment_end:_y,lightprobes_pars_fragment:xy,logdepthbuf_fragment:vy,logdepthbuf_pars_fragment:yy,logdepthbuf_pars_vertex:My,logdepthbuf_vertex:by,map_fragment:Sy,map_pars_fragment:wy,map_particle_fragment:Ty,map_particle_pars_fragment:Ey,metalnessmap_fragment:Ay,metalnessmap_pars_fragment:Cy,morphinstance_vertex:Ry,morphcolor_vertex:Py,morphnormal_vertex:Iy,morphtarget_pars_vertex:Dy,morphtarget_vertex:Ly,normal_fragment_begin:Ny,normal_fragment_maps:Uy,normal_pars_fragment:Fy,normal_pars_vertex:Oy,normal_vertex:By,normalmap_pars_fragment:zy,clearcoat_normal_fragment_begin:ky,clearcoat_normal_fragment_maps:Vy,clearcoat_pars_fragment:Gy,iridescence_pars_fragment:Hy,opaque_fragment:Wy,packing:Xy,premultiplied_alpha_fragment:qy,project_vertex:Yy,dithering_fragment:Zy,dithering_pars_fragment:Ky,roughnessmap_fragment:Jy,roughnessmap_pars_fragment:$y,shadowmap_pars_fragment:jy,shadowmap_pars_vertex:Qy,shadowmap_vertex:eM,shadowmask_pars_fragment:tM,skinbase_vertex:iM,skinning_pars_vertex:nM,skinning_vertex:sM,skinnormal_vertex:rM,specularmap_fragment:aM,specularmap_pars_fragment:oM,tonemapping_fragment:lM,tonemapping_pars_fragment:cM,transmission_fragment:hM,transmission_pars_fragment:uM,uv_pars_fragment:dM,uv_pars_vertex:fM,uv_vertex:pM,worldpos_vertex:mM,background_vert:gM,background_frag:_M,backgroundCube_vert:xM,backgroundCube_frag:vM,cube_vert:yM,cube_frag:MM,depth_vert:bM,depth_frag:SM,distance_vert:wM,distance_frag:TM,equirect_vert:EM,equirect_frag:AM,linedashed_vert:CM,linedashed_frag:RM,meshbasic_vert:PM,meshbasic_frag:IM,meshlambert_vert:DM,meshlambert_frag:LM,meshmatcap_vert:NM,meshmatcap_frag:UM,meshnormal_vert:FM,meshnormal_frag:OM,meshphong_vert:BM,meshphong_frag:zM,meshphysical_vert:kM,meshphysical_frag:VM,meshtoon_vert:GM,meshtoon_frag:HM,points_vert:WM,points_frag:XM,shadow_vert:qM,shadow_frag:YM,sprite_vert:ZM,sprite_frag:KM},Se={common:{diffuse:{value:new ae(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Je},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Je}},envmap:{envMap:{value:null},envMapRotation:{value:new Je},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Je}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Je}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Je},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Je},normalScale:{value:new Z(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Je},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Je}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Je}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Je}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ae(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new C},probesMax:{value:new C},probesResolution:{value:new C}},points:{diffuse:{value:new ae(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0},uvTransform:{value:new Je}},sprite:{diffuse:{value:new ae(16777215)},opacity:{value:1},center:{value:new Z(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Je},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0}}},cn={basic:{uniforms:li([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.fog]),vertexShader:tt.meshbasic_vert,fragmentShader:tt.meshbasic_frag},lambert:{uniforms:li([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,Se.lights,{emissive:{value:new ae(0)},envMapIntensity:{value:1}}]),vertexShader:tt.meshlambert_vert,fragmentShader:tt.meshlambert_frag},phong:{uniforms:li([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,Se.lights,{emissive:{value:new ae(0)},specular:{value:new ae(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:tt.meshphong_vert,fragmentShader:tt.meshphong_frag},standard:{uniforms:li([Se.common,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.roughnessmap,Se.metalnessmap,Se.fog,Se.lights,{emissive:{value:new ae(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag},toon:{uniforms:li([Se.common,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.gradientmap,Se.fog,Se.lights,{emissive:{value:new ae(0)}}]),vertexShader:tt.meshtoon_vert,fragmentShader:tt.meshtoon_frag},matcap:{uniforms:li([Se.common,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,{matcap:{value:null}}]),vertexShader:tt.meshmatcap_vert,fragmentShader:tt.meshmatcap_frag},points:{uniforms:li([Se.points,Se.fog]),vertexShader:tt.points_vert,fragmentShader:tt.points_frag},dashed:{uniforms:li([Se.common,Se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:tt.linedashed_vert,fragmentShader:tt.linedashed_frag},depth:{uniforms:li([Se.common,Se.displacementmap]),vertexShader:tt.depth_vert,fragmentShader:tt.depth_frag},normal:{uniforms:li([Se.common,Se.bumpmap,Se.normalmap,Se.displacementmap,{opacity:{value:1}}]),vertexShader:tt.meshnormal_vert,fragmentShader:tt.meshnormal_frag},sprite:{uniforms:li([Se.sprite,Se.fog]),vertexShader:tt.sprite_vert,fragmentShader:tt.sprite_frag},background:{uniforms:{uvTransform:{value:new Je},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:tt.background_vert,fragmentShader:tt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Je}},vertexShader:tt.backgroundCube_vert,fragmentShader:tt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:tt.cube_vert,fragmentShader:tt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:tt.equirect_vert,fragmentShader:tt.equirect_frag},distance:{uniforms:li([Se.common,Se.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:tt.distance_vert,fragmentShader:tt.distance_frag},shadow:{uniforms:li([Se.lights,Se.fog,{color:{value:new ae(0)},opacity:{value:1}}]),vertexShader:tt.shadow_vert,fragmentShader:tt.shadow_frag}};cn.physical={uniforms:li([cn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Je},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Je},clearcoatNormalScale:{value:new Z(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Je},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Je},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Je},sheen:{value:0},sheenColor:{value:new ae(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Je},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Je},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Je},transmissionSamplerSize:{value:new Z},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Je},attenuationDistance:{value:0},attenuationColor:{value:new ae(0)},specularColor:{value:new ae(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Je},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Je},anisotropyVector:{value:new Z},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Je}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag};var Pu={r:0,b:0,g:0},JM=new qe,M0=new Je;M0.set(-1,0,0,0,1,0,0,0,1);function $M(s,e,t,i,n,r){let a=new ae(0),o=n===!0?0:1,l,c,h=null,d=0,u=null;function f(y){let w=y.isScene===!0?y.background:null;if(w&&w.isTexture){let v=y.backgroundBlurriness>0;w=e.get(w,v)}return w}function p(y){let w=!1,v=f(y);v===null?g(a,o):v&&v.isColor&&(g(v,1),w=!0);let b=s.xr.getEnvironmentBlendMode();b==="additive"?t.buffers.color.setClear(0,0,0,1,r):b==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(s.autoClear||w)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(y,w){let v=f(w);v&&(v.isCubeTexture||v.mapping===nr)?(c===void 0&&(c=new st(new jt(1,1,1),new Rt({name:"BackgroundCubeMaterial",uniforms:or(cn.backgroundCube.uniforms),vertexShader:cn.backgroundCube.vertexShader,fragmentShader:cn.backgroundCube.fragmentShader,side:oi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,M,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(JM.makeRotationFromEuler(w.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(M0),c.material.toneMapped=nt.getTransfer(v.colorSpace)!==ut,(h!==v||d!==v.version||u!==s.toneMapping)&&(c.material.needsUpdate=!0,h=v,d=v.version,u=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new st(new Ri(2,2),new Rt({name:"BackgroundMaterial",uniforms:or(cn.background.uniforms),vertexShader:cn.background.vertexShader,fragmentShader:cn.background.fragmentShader,side:Bn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.toneMapped=nt.getTransfer(v.colorSpace)!==ut,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||d!==v.version||u!==s.toneMapping)&&(l.material.needsUpdate=!0,h=v,d=v.version,u=s.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function g(y,w){y.getRGB(Pu,Gf(s)),t.buffers.color.setClear(Pu.r,Pu.g,Pu.b,w,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,w=1){a.set(y),o=w,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(y){o=y,g(a,o)},render:p,addToRenderList:_,dispose:m}}function jM(s,e){let t=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=u(null),r=n,a=!1;function o(I,U,O,D,B){let X=!1,k=d(I,D,O,U);r!==k&&(r=k,c(r.object)),X=f(I,D,O,B),X&&p(I,D,O,B),B!==null&&e.update(B,s.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,v(I,U,O,D),B!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function l(){return s.createVertexArray()}function c(I){return s.bindVertexArray(I)}function h(I){return s.deleteVertexArray(I)}function d(I,U,O,D){let B=D.wireframe===!0,X=i[U.id];X===void 0&&(X={},i[U.id]=X);let k=I.isInstancedMesh===!0?I.id:0,ne=X[k];ne===void 0&&(ne={},X[k]=ne);let q=ne[O.id];q===void 0&&(q={},ne[O.id]=q);let ee=q[B];return ee===void 0&&(ee=u(l()),q[B]=ee),ee}function u(I){let U=[],O=[],D=[];for(let B=0;B<t;B++)U[B]=0,O[B]=0,D[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:O,attributeDivisors:D,object:I,attributes:{},index:null}}function f(I,U,O,D){let B=r.attributes,X=U.attributes,k=0,ne=O.getAttributes();for(let q in ne)if(ne[q].location>=0){let $=B[q],H=X[q];if(H===void 0&&(q==="instanceMatrix"&&I.instanceMatrix&&(H=I.instanceMatrix),q==="instanceColor"&&I.instanceColor&&(H=I.instanceColor)),$===void 0||$.attribute!==H||H&&$.data!==H.data)return!0;k++}return r.attributesNum!==k||r.index!==D}function p(I,U,O,D){let B={},X=U.attributes,k=0,ne=O.getAttributes();for(let q in ne)if(ne[q].location>=0){let $=X[q];$===void 0&&(q==="instanceMatrix"&&I.instanceMatrix&&($=I.instanceMatrix),q==="instanceColor"&&I.instanceColor&&($=I.instanceColor));let H={};H.attribute=$,$&&$.data&&(H.data=$.data),B[q]=H,k++}r.attributes=B,r.attributesNum=k,r.index=D}function _(){let I=r.newAttributes;for(let U=0,O=I.length;U<O;U++)I[U]=0}function g(I){m(I,0)}function m(I,U){let O=r.newAttributes,D=r.enabledAttributes,B=r.attributeDivisors;O[I]=1,D[I]===0&&(s.enableVertexAttribArray(I),D[I]=1),B[I]!==U&&(s.vertexAttribDivisor(I,U),B[I]=U)}function y(){let I=r.newAttributes,U=r.enabledAttributes;for(let O=0,D=U.length;O<D;O++)U[O]!==I[O]&&(s.disableVertexAttribArray(O),U[O]=0)}function w(I,U,O,D,B,X,k){k===!0?s.vertexAttribIPointer(I,U,O,B,X):s.vertexAttribPointer(I,U,O,D,B,X)}function v(I,U,O,D){_();let B=D.attributes,X=O.getAttributes(),k=U.defaultAttributeValues;for(let ne in X){let q=X[ne];if(q.location>=0){let ee=B[ne];if(ee===void 0&&(ne==="instanceMatrix"&&I.instanceMatrix&&(ee=I.instanceMatrix),ne==="instanceColor"&&I.instanceColor&&(ee=I.instanceColor)),ee!==void 0){let $=ee.normalized,H=ee.itemSize,Q=e.get(ee);if(Q===void 0)continue;let Ie=Q.buffer,He=Q.type,rt=Q.bytesPerElement,K=He===s.INT||He===s.UNSIGNED_INT||ee.gpuType===Ml;if(ee.isInterleavedBufferAttribute){let se=ee.data,me=se.stride,Ve=ee.offset;if(se.isInstancedInterleavedBuffer){for(let xe=0;xe<q.locationSize;xe++)m(q.location+xe,se.meshPerAttribute);I.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let xe=0;xe<q.locationSize;xe++)g(q.location+xe);s.bindBuffer(s.ARRAY_BUFFER,Ie);for(let xe=0;xe<q.locationSize;xe++)w(q.location+xe,H/q.locationSize,He,$,me*rt,(Ve+H/q.locationSize*xe)*rt,K)}else{if(ee.isInstancedBufferAttribute){for(let se=0;se<q.locationSize;se++)m(q.location+se,ee.meshPerAttribute);I.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let se=0;se<q.locationSize;se++)g(q.location+se);s.bindBuffer(s.ARRAY_BUFFER,Ie);for(let se=0;se<q.locationSize;se++)w(q.location+se,H/q.locationSize,He,$,H*rt,H/q.locationSize*se*rt,K)}}else if(k!==void 0){let $=k[ne];if($!==void 0)switch($.length){case 2:s.vertexAttrib2fv(q.location,$);break;case 3:s.vertexAttrib3fv(q.location,$);break;case 4:s.vertexAttrib4fv(q.location,$);break;default:s.vertexAttrib1fv(q.location,$)}}}}y()}function b(){T();for(let I in i){let U=i[I];for(let O in U){let D=U[O];for(let B in D){let X=D[B];for(let k in X)h(X[k].object),delete X[k];delete D[B]}}delete i[I]}}function M(I){if(i[I.id]===void 0)return;let U=i[I.id];for(let O in U){let D=U[O];for(let B in D){let X=D[B];for(let k in X)h(X[k].object),delete X[k];delete D[B]}}delete i[I.id]}function A(I){for(let U in i){let O=i[U];for(let D in O){let B=O[D];if(B[I.id]===void 0)continue;let X=B[I.id];for(let k in X)h(X[k].object),delete X[k];delete B[I.id]}}}function x(I){for(let U in i){let O=i[U],D=I.isInstancedMesh===!0?I.id:0,B=O[D];if(B!==void 0){for(let X in B){let k=B[X];for(let ne in k)h(k[ne].object),delete k[ne];delete B[X]}delete O[D],Object.keys(O).length===0&&delete i[U]}}}function T(){R(),a=!0,r!==n&&(r=n,c(r.object))}function R(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:o,reset:T,resetDefaultState:R,dispose:b,releaseStatesOfGeometry:M,releaseStatesOfObject:x,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:g,disableUnusedAttributes:y}}function QM(s,e,t){let i;function n(l){i=l}function r(l,c){s.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,h){h!==0&&(s.drawArraysInstanced(i,l,c,h),t.update(c,i,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let f=0;f<h;f++)u+=c[f];t.update(u,i,1)}this.setMode=n,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function eb(s,e,t,i){let n;function r(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");n=s.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function a(A){return!(A!==ri&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){let x=A===Jt&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==gi&&A!==si&&!x&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(_e("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&_e("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),p=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),y=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),w=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),b=s.getParameter(s.MAX_SAMPLES),M=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:p,maxTextureSize:_,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:y,maxVaryings:w,maxFragmentUniforms:v,maxSamples:b,samples:M}}function tb(s){let e=this,t=null,i=0,n=!1,r=!1,a=new vi,o=new Je,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||i!==0||n;return n=u,i=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,f){let p=d.clippingPlanes,_=d.clipIntersection,g=d.clipShadows,m=s.get(d);if(!n||p===null||p.length===0||r&&!g)r?h(null):c();else{let y=r?0:i,w=y*4,v=m.clippingState||null;l.value=v,v=h(p,u,w,f);for(let b=0;b!==w;++b)v[b]=t[b];m.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(d,u,f,p){let _=d!==null?d.length:0,g=null;if(_!==0){if(g=l.value,p!==!0||g===null){let m=f+_*4,y=u.matrixWorldInverse;o.getNormalMatrix(y),(g===null||g.length<m)&&(g=new Float32Array(m));for(let w=0,v=f;w!==_;++w,v+=4)a.copy(d[w]).applyMatrix4(y,o),a.normal.toArray(g,v),g[v+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,g}}var Fa=4,ib=6,nb=20,sb=256,oc=new Gi,Qg=new ae,qf=null,Yf=0,Zf=0,Kf=!1,rb=new C,lr=new C,hc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,n=100,r={}){let{size:a=256,position:o=rb}=r;qf=this._renderer.getRenderTarget(),Yf=this._renderer.getActiveCubeFace(),Zf=this._renderer.getActiveMipmapLevel(),Kf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,n,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=i0(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=t0(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(qf,Yf,Zf),this._renderer.xr.enabled=Kf,e.scissorTest=!1,Ua(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===on||e.mapping===kn?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),qf=this._renderer.getRenderTarget(),Yf=this._renderer.getActiveCubeFace(),Zf=this._renderer.getActiveMipmapLevel(),Kf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Tt,minFilter:Tt,generateMipmaps:!1,type:Jt,format:ri,colorSpace:Vr,depthBuffer:!1},n=e0(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=e0(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=ab(r)),this._blurMaterial=lb(r,e,t),this._ggxMaterial=ob(r,e,t)}return n}_compileMaterial(e){let t=new st(new Ye,e);this._renderer.compile(t,oc)}_sceneToCubeUV(e,t,i,n,r){let l=new kt(90,1,t,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Qg),d.toneMapping=Xi,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(n),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new st(new jt,new dt({name:"PMREM.Background",side:oi,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,g=_.material,m=!1,y=e.background;y?y.isColor&&(g.color.copy(y),e.background=null,m=!0):(g.color.copy(Qg),m=!0);for(let w=0;w<6;w++){let v=w%3;v===0?(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[w],r.y,r.z)):v===1?(l.up.set(0,0,c[w]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[w],r.z)):(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[w]));let b=this._cubeSize;Ua(n,v*b,w>2?b:0,b,b),d.setRenderTarget(n),m&&d.render(_,l),d.render(e,l)}d.toneMapping=f,d.autoClear=u,e.background=y}_textureToCubeUV(e,t){let i=this._renderer,n=e.mapping===on||e.mapping===kn;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=i0()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=t0());let r=n?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;Ua(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,oc)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let n=this._lodMeshes.length;for(let r=1;r<n;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let n=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let l=a.uniforms,c=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,f=d*u,{_lodMax:p}=this,_=this._sizeLods[i],g=3*_*(i>p-Fa?i-p+Fa:0),m=4*(this._cubeSize-_);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=p-t,Ua(r,g,m,3*_,2*_),n.setRenderTarget(r),n.render(o,oc),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=p-i,Ua(e,g,m,3*_,2*_),n.setRenderTarget(e),n.render(o,oc)}_blur(e,t,i,n){let r=this._pingPongRenderTarget,a=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,i,a),this._blurPass(r,e,i,i,a)}_blurPass(e,t,i,n,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[n];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],d=3*h*(n>this._lodMax-Fa?n-this._lodMax+Fa:0),u=4*(this._cubeSize-h);Ua(t,d,u,3*h,2*h),a.setRenderTarget(t),a.render(l,oc)}};function ab(s){let e=[],t=[],i=s,n=s-Fa+1+ib;for(let r=0;r<n;r++){let a=Math.pow(2,i);e.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,f=3,p=new Float32Array(f*u*d),_=new Float32Array(f*u*d);for(let m=0;m<d;m++){let y=m%3*2/3-1,w=m>2?0:-1,v=[y,w,0,y+2/3,w,0,y+2/3,w+1,0,y,w,0,y+2/3,w+1,0,y,w+1,0];p.set(v,f*u*m);for(let b=0;b<u;b++){let M=h[b*2]*2-1,A=h[b*2+1]*2-1;m===0?lr.set(1,A,M):m===1?lr.set(-M,1,-A):m===2?lr.set(-M,A,1):m===3?lr.set(-1,A,-M):m===4?lr.set(-M,-1,A):lr.set(M,A,-1),lr.toArray(_,(m*u+b)*f)}}let g=new Ye;g.setAttribute("position",new ft(p,f)),g.setAttribute("outputDirection",new ft(_,f)),t.push(new st(g,null)),i>Fa&&i--}return{lodMeshes:t,sizeLods:e}}function e0(s,e,t){let i=new Ct(s,e,t);return i.texture.mapping=nr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ua(s,e,t,i,n){s.viewport.set(e,t,i,n),s.scissor.set(e,t,i,n)}function ob(s,e,t){return new Rt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:sb,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Du(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function lb(s,e,t){return new Rt({name:"SphericalGaussianBlur",defines:{SAMPLES:nb,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Du(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function t0(){return new Rt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Du(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function i0(){return new Rt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Du(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function Du(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var uc=class extends Ct{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},n=[i,i,i,i,i,i];this.texture=new ss(n),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},n=new jt(5,5,5),r=new Rt({name:"CubemapFromEquirect",uniforms:or(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:oi,blending:Pi});r.uniforms.tEquirect.value=t;let a=new st(n,r),o=t.minFilter;return t.minFilter===ln&&(t.minFilter=Tt),new pl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,n=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,n);e.setRenderTarget(r)}};function cb(s){let e=new WeakMap,t=new WeakMap,i=null;function n(u,f=!1){return u==null?null:f?a(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===wa||f===Ta)if(e.has(u)){let p=e.get(u).texture;return o(p,u.mapping)}else{let p=u.image;if(p&&p.height>0){let _=new uc(p.height);return _.fromEquirectangularTexture(s,u),e.set(u,_),u.addEventListener("dispose",c),o(_.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let f=u.mapping,p=f===wa||f===Ta,_=f===on||f===kn;if(p||_){let g=t.get(u),m=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return i===null&&(i=new hc(s)),g=p?i.fromEquirectangular(u,g):i.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),g.texture;if(g!==void 0)return g.texture;{let y=u.image;return p&&y&&y.height>0||_&&y&&l(y)?(i===null&&(i=new hc(s)),g=p?i.fromEquirectangular(u):i.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),u.addEventListener("dispose",h),g.texture):null}}}return u}function o(u,f){return f===wa?u.mapping=on:f===Ta&&(u.mapping=kn),u}function l(u){let f=0,p=6;for(let _=0;_<p;_++)u[_]!==void 0&&f++;return f===p}function c(u){let f=u.target;f.removeEventListener("dispose",c);let p=e.get(f);p!==void 0&&(e.delete(f),p.dispose())}function h(u){let f=u.target;f.removeEventListener("dispose",h);let p=t.get(f);p!==void 0&&(t.delete(f),p.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:d}}function hb(s){let e={};function t(i){if(e[i]!==void 0)return e[i];let n=s.getExtension(i);return e[i]=n,n}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let n=t(i);return n===null&&fn("WebGLRenderer: "+i+" extension not supported."),n}}}function ub(s,e,t,i){let n={},r=new WeakMap;function a(d){let u=d.target;u.index!==null&&e.remove(u.index);for(let p in u.attributes)e.remove(u.attributes[p]);u.removeEventListener("dispose",a),delete n[u.id];let f=r.get(u);f&&(e.remove(f),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(d,u){return n[u.id]===!0||(u.addEventListener("dispose",a),n[u.id]=!0,t.memory.geometries++),u}function l(d){let u=d.attributes;for(let f in u)e.update(u[f],s.ARRAY_BUFFER)}function c(d){let u=[],f=d.index,p=d.attributes.position,_=0;if(p===void 0)return;if(f!==null){let y=f.array;_=f.version;for(let w=0,v=y.length;w<v;w+=3){let b=y[w+0],M=y[w+1],A=y[w+2];u.push(b,M,M,A,A,b)}}else{let y=p.array;_=p.version;for(let w=0,v=y.length/3-1;w<v;w+=3){let b=w+0,M=w+1,A=w+2;u.push(b,M,M,A,A,b)}}let g=new(p.count>=65535?Yr:qr)(u,1);g.version=_;let m=r.get(d);m&&e.remove(m),r.set(d,g)}function h(d){let u=r.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function db(s,e,t){let i;function n(d){i=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,u){s.drawElements(i,u,r,d*a),t.update(u,i,1)}function c(d,u,f){f!==0&&(s.drawElementsInstanced(i,u,r,d*a,f),t.update(u,i,f))}function h(d,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,d,0,f);let _=0;for(let g=0;g<f;g++)_+=u[g];t.update(_,i,1)}this.setMode=n,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function fb(s){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case s.TRIANGLES:t.triangles+=o*(r/3);break;case s.LINES:t.lines+=o*(r/2);break;case s.LINE_STRIP:t.lines+=o*(r-1);break;case s.LINE_LOOP:t.lines+=o*r;break;case s.POINTS:t.points+=o*r;break;default:Ue("WebGLInfo: Unknown draw mode:",a);break}}function n(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:n,update:i}}function pb(s,e,t){let i=new WeakMap,n=new xt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==d){let T=function(){A.dispose(),i.delete(o),o.removeEventListener("dispose",T)};u!==void 0&&u.texture.dispose();let f=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],y=o.morphAttributes.color||[],w=0;f===!0&&(w=1),p===!0&&(w=2),_===!0&&(w=3);let v=o.attributes.position.count*w,b=1;v>e.maxTextureSize&&(b=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let M=new Float32Array(v*b*4*d),A=new Ns(M,v,b,d);A.type=si,A.needsUpdate=!0;let x=w*4;for(let R=0;R<d;R++){let I=g[R],U=m[R],O=y[R],D=v*b*4*R;for(let B=0;B<I.count;B++){let X=B*x;f===!0&&(n.fromBufferAttribute(I,B),M[D+X+0]=n.x,M[D+X+1]=n.y,M[D+X+2]=n.z,M[D+X+3]=0),p===!0&&(n.fromBufferAttribute(U,B),M[D+X+4]=n.x,M[D+X+5]=n.y,M[D+X+6]=n.z,M[D+X+7]=0),_===!0&&(n.fromBufferAttribute(O,B),M[D+X+8]=n.x,M[D+X+9]=n.y,M[D+X+10]=n.z,M[D+X+11]=O.itemSize===4?n.w:1)}}u={count:d,texture:A,size:new Z(v,b)},i.set(o,u),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let p=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",p),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",u.size)}return{update:r}}function mb(s,e,t,i,n){let r=new WeakMap;function a(c){let h=n.render.frame,d=c.geometry,u=e.get(c,d);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var gb={[xa]:"LINEAR_TONE_MAPPING",[va]:"REINHARD_TONE_MAPPING",[ya]:"CINEON_TONE_MAPPING",[us]:"ACES_FILMIC_TONE_MAPPING",[ba]:"AGX_TONE_MAPPING",[Sa]:"NEUTRAL_TONE_MAPPING",[Ma]:"CUSTOM_TONE_MAPPING"};function _b(s,e,t,i,n,r){let a=new Ct(e,t,{type:s,depthBuffer:n,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Ye;c.setAttribute("position",new Te([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Te([0,2,0,0,2,0],2));let h=new os({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new st(c,h),u=new Gi(-1,1,1,-1,0,1),f=null,p=null,_=!1,g,m=null,y=[],w=!1;this.setSize=function(v,b){a.setSize(v,b),o!==null&&o.setSize(v,b),l!==null&&l.setSize(v,b);for(let M=0;M<y.length;M++){let A=y[M];A.setSize&&A.setSize(v,b)}},this.setEffects=function(v){y=v,w=y.length>0&&y[0].isRenderPass===!0;let b=a.width,M=a.height;y.length>0&&o===null&&(o=new Ct(b,M,{type:Jt,depthBuffer:!1,stencilBuffer:!1}),l=new Ct(b,M,{type:Jt,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<y.length;A++){let x=y[A];x.setSize&&x.setSize(b,M)}},this.begin=function(v,b){if(_||v.toneMapping===Xi&&y.length===0)return!1;if(m=b,b!==null){let M=b.width,A=b.height;(a.width!==M||a.height!==A)&&this.setSize(M,A)}return w===!1&&v.setRenderTarget(a),g=v.toneMapping,v.toneMapping=Xi,!0},this.hasRenderPass=function(){return w},this.end=function(v,b){v.toneMapping=g,_=!0;let M=a,A=o;for(let x=0;x<y.length;x++){let T=y[x];T.enabled!==!1&&(T.render(v,A,M,b),T.needsSwap!==!1&&(M=A,A=A===o?l:o))}if(f!==v.outputColorSpace||p!==v.toneMapping){f=v.outputColorSpace,p=v.toneMapping,h.defines={},nt.getTransfer(f)===ut&&(h.defines.SRGB_TRANSFER="");let x=gb[p];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=M.texture,v.setRenderTarget(m),v.render(d,u),m=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var b0=new Lt,jf=new Un(1,1),S0=new Ns,w0=new Us,T0=new ss,n0=[],s0=[],r0=new Float32Array(16),a0=new Float32Array(9),o0=new Float32Array(4);function Ba(s,e,t){let i=s[0];if(i<=0||i>0)return s;let n=e*t,r=n0[n];if(r===void 0&&(r=new Float32Array(n),n0[n]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function Xt(s,e){if(s.length!==e.length)return!1;for(let t=0,i=s.length;t<i;t++)if(s[t]!==e[t])return!1;return!0}function qt(s,e){for(let t=0,i=e.length;t<i;t++)s[t]=e[t]}function Lu(s,e){let t=s0[e];t===void 0&&(t=new Int32Array(e),s0[e]=t);for(let i=0;i!==e;++i)t[i]=s.allocateTextureUnit();return t}function xb(s,e){let t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function vb(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;s.uniform2fv(this.addr,e),qt(t,e)}}function yb(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Xt(t,e))return;s.uniform3fv(this.addr,e),qt(t,e)}}function Mb(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;s.uniform4fv(this.addr,e),qt(t,e)}}function bb(s,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;o0.set(i),s.uniformMatrix2fv(this.addr,!1,o0),qt(t,i)}}function Sb(s,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;a0.set(i),s.uniformMatrix3fv(this.addr,!1,a0),qt(t,i)}}function wb(s,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;r0.set(i),s.uniformMatrix4fv(this.addr,!1,r0),qt(t,i)}}function Tb(s,e){let t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function Eb(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;s.uniform2iv(this.addr,e),qt(t,e)}}function Ab(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;s.uniform3iv(this.addr,e),qt(t,e)}}function Cb(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;s.uniform4iv(this.addr,e),qt(t,e)}}function Rb(s,e){let t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Pb(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;s.uniform2uiv(this.addr,e),qt(t,e)}}function Ib(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;s.uniform3uiv(this.addr,e),qt(t,e)}}function Db(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;s.uniform4uiv(this.addr,e),qt(t,e)}}function Lb(s,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(jf.compareFunction=t.isReversedDepthBuffer()?rc:sc,r=jf):r=b0,t.setTexture2D(e||r,n)}function Nb(s,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),t.setTexture3D(e||w0,n)}function Ub(s,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),t.setTextureCube(e||T0,n)}function Fb(s,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),t.setTexture2DArray(e||S0,n)}function Ob(s){switch(s){case 5126:return xb;case 35664:return vb;case 35665:return yb;case 35666:return Mb;case 35674:return bb;case 35675:return Sb;case 35676:return wb;case 5124:case 35670:return Tb;case 35667:case 35671:return Eb;case 35668:case 35672:return Ab;case 35669:case 35673:return Cb;case 5125:return Rb;case 36294:return Pb;case 36295:return Ib;case 36296:return Db;case 35678:case 36198:case 36298:case 36306:case 35682:return Lb;case 35679:case 36299:case 36307:return Nb;case 35680:case 36300:case 36308:case 36293:return Ub;case 36289:case 36303:case 36311:case 36292:return Fb}}function Bb(s,e){s.uniform1fv(this.addr,e)}function zb(s,e){let t=Ba(e,this.size,2);s.uniform2fv(this.addr,t)}function kb(s,e){let t=Ba(e,this.size,3);s.uniform3fv(this.addr,t)}function Vb(s,e){let t=Ba(e,this.size,4);s.uniform4fv(this.addr,t)}function Gb(s,e){let t=Ba(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function Hb(s,e){let t=Ba(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Wb(s,e){let t=Ba(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function Xb(s,e){s.uniform1iv(this.addr,e)}function qb(s,e){s.uniform2iv(this.addr,e)}function Yb(s,e){s.uniform3iv(this.addr,e)}function Zb(s,e){s.uniform4iv(this.addr,e)}function Kb(s,e){s.uniform1uiv(this.addr,e)}function Jb(s,e){s.uniform2uiv(this.addr,e)}function $b(s,e){s.uniform3uiv(this.addr,e)}function jb(s,e){s.uniform4uiv(this.addr,e)}function Qb(s,e,t){let i=this.cache,n=e.length,r=Lu(t,n);Xt(i,r)||(s.uniform1iv(this.addr,r),qt(i,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=jf:a=b0;for(let o=0;o!==n;++o)t.setTexture2D(e[o]||a,r[o])}function eS(s,e,t){let i=this.cache,n=e.length,r=Lu(t,n);Xt(i,r)||(s.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==n;++a)t.setTexture3D(e[a]||w0,r[a])}function tS(s,e,t){let i=this.cache,n=e.length,r=Lu(t,n);Xt(i,r)||(s.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==n;++a)t.setTextureCube(e[a]||T0,r[a])}function iS(s,e,t){let i=this.cache,n=e.length,r=Lu(t,n);Xt(i,r)||(s.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==n;++a)t.setTexture2DArray(e[a]||S0,r[a])}function nS(s){switch(s){case 5126:return Bb;case 35664:return zb;case 35665:return kb;case 35666:return Vb;case 35674:return Gb;case 35675:return Hb;case 35676:return Wb;case 5124:case 35670:return Xb;case 35667:case 35671:return qb;case 35668:case 35672:return Yb;case 35669:case 35673:return Zb;case 5125:return Kb;case 36294:return Jb;case 36295:return $b;case 36296:return jb;case 35678:case 36198:case 36298:case 36306:case 35682:return Qb;case 35679:case 36299:case 36307:return eS;case 35680:case 36300:case 36308:case 36293:return tS;case 36289:case 36303:case 36311:case 36292:return iS}}var Qf=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Ob(t.type)}},ep=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=nS(t.type)}},tp=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let n=this.seq;for(let r=0,a=n.length;r!==a;++r){let o=n[r];o.setValue(e,t[o.id],i)}}},Jf=/(\w+)(\])?(\[|\.)?/g;function l0(s,e){s.seq.push(e),s.map[e.id]=e}function sS(s,e,t){let i=s.name,n=i.length;for(Jf.lastIndex=0;;){let r=Jf.exec(i),a=Jf.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===n){l0(t,c===void 0?new Qf(o,s,e):new ep(o,s,e));break}else{let d=t.map[o];d===void 0&&(d=new tp(o),l0(t,d)),t=d}}}var Oa=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);sS(o,l,this)}let n=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?n.push(a):r.push(a);n.length>0&&(this.seq=n.concat(r))}setValue(e,t,i,n){let r=this.map[t];r!==void 0&&r.setValue(e,i,n)}setOptional(e,t,i){let n=t[i];n!==void 0&&this.setValue(e,i,n)}static upload(e,t,i,n){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,n)}}static seqWithValue(e,t){let i=[];for(let n=0,r=e.length;n!==r;++n){let a=e[n];a.id in t&&i.push(a)}return i}};function c0(s,e,t){let i=s.createShader(e);return s.shaderSource(i,t),s.compileShader(i),i}var rS=37297,aS=0;function oS(s,e){let t=s.split(`
`),i=[],n=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=n;a<r;a++){let o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}var h0=new Je;function lS(s){nt._getMatrix(h0,nt.workingColorSpace,s);let e=`mat3( ${h0.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(s)){case Gr:return[e,"LinearTransferOETF"];case ut:return[e,"sRGBTransferOETF"];default:return _e("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function u0(s,e,t){let i=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+oS(s.getShaderSource(e),o)}else return r}function cS(s,e){let t=lS(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var hS={[xa]:"Linear",[va]:"Reinhard",[ya]:"Cineon",[us]:"ACESFilmic",[ba]:"AgX",[Sa]:"Neutral",[Ma]:"Custom"};function uS(s,e){let t=hS[e];return t===void 0?(_e("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Iu=new C;function dS(){nt.getLuminanceCoefficients(Iu);let s=Iu.x.toFixed(4),e=Iu.y.toFixed(4),t=Iu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function fS(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(cc).join(`
`)}function pS(s){let e=[];for(let t in s){let i=s[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function mS(s,e){let t={},i=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let r=s.getActiveAttrib(e,n),a=r.name,o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:s.getAttribLocation(e,a),locationSize:o}}return t}function cc(s){return s!==""}function d0(s,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function f0(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var gS=/^[ \t]*#include +<([\w\d./]+)>/gm;function ip(s){return s.replace(gS,xS)}var _S=new Map;function xS(s,e){let t=tt[e];if(t===void 0){let i=_S.get(e);if(i!==void 0)t=tt[i],_e('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return ip(t)}var vS=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function p0(s){return s.replace(vS,yS)}function yS(s,e,t,i){let n="";for(let r=parseInt(e);r<parseInt(t);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function m0(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var MS={[ga]:"SHADOWMAP_TYPE_PCF",[tr]:"SHADOWMAP_TYPE_VSM"};function bS(s){return MS[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var SS={[on]:"ENVMAP_TYPE_CUBE",[kn]:"ENVMAP_TYPE_CUBE",[nr]:"ENVMAP_TYPE_CUBE_UV"};function wS(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":SS[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var TS={[kn]:"ENVMAP_MODE_REFRACTION"};function ES(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":TS[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var AS={[_a]:"ENVMAP_BLENDING_MULTIPLY",[wf]:"ENVMAP_BLENDING_MIX",[Tf]:"ENVMAP_BLENDING_ADD"};function CS(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":AS[s.combine]||"ENVMAP_BLENDING_NONE"}function RS(s){let e=s.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function PS(s,e,t,i){let n=s.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=bS(t),c=wS(t),h=ES(t),d=CS(t),u=RS(t),f=fS(t),p=pS(r),_=n.createProgram(),g,m,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(cc).join(`
`),g.length>0&&(g+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(cc).join(`
`),m.length>0&&(m+=`
`)):(g=[m0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(cc).join(`
`),m=[m0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Xi?"#define TONE_MAPPING":"",t.toneMapping!==Xi?tt.tonemapping_pars_fragment:"",t.toneMapping!==Xi?uS("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",tt.colorspace_pars_fragment,cS("linearToOutputTexel",t.outputColorSpace),dS(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(cc).join(`
`)),a=ip(a),a=d0(a,t),a=f0(a,t),o=ip(o),o=d0(o,t),o=f0(o,t),a=p0(a),o=p0(o),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,m=["#define varying in",t.glslVersion===Cu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Cu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let w=y+g+a,v=y+m+o,b=c0(n,n.VERTEX_SHADER,w),M=c0(n,n.FRAGMENT_SHADER,v);n.attachShader(_,b),n.attachShader(_,M),t.index0AttributeName!==void 0?n.bindAttribLocation(_,0,t.index0AttributeName):t.hasPositionAttribute===!0&&n.bindAttribLocation(_,0,"position"),n.linkProgram(_);function A(I){if(s.debug.checkShaderErrors){let U=n.getProgramInfoLog(_)||"",O=n.getShaderInfoLog(b)||"",D=n.getShaderInfoLog(M)||"",B=U.trim(),X=O.trim(),k=D.trim(),ne=!0,q=!0;if(n.getProgramParameter(_,n.LINK_STATUS)===!1)if(ne=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,_,b,M);else{let ee=u0(n,b,"vertex"),$=u0(n,M,"fragment");Ue("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(_,n.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+B+`
`+ee+`
`+$)}else B!==""?_e("WebGLProgram: Program Info Log:",B):(X===""||k==="")&&(q=!1);q&&(I.diagnostics={runnable:ne,programLog:B,vertexShader:{log:X,prefix:g},fragmentShader:{log:k,prefix:m}})}n.deleteShader(b),n.deleteShader(M),x=new Oa(n,_),T=mS(n,_)}let x;this.getUniforms=function(){return x===void 0&&A(this),x};let T;this.getAttributes=function(){return T===void 0&&A(this),T};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=n.getProgramParameter(_,rS)),R},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=aS++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=b,this.fragmentShader=M,this}var IS=0,np=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let n=this._getShaderCacheForMaterial(e);return n.has(t)===!1&&(n.add(t),t.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new sp(e),t.set(e,i)),i}},sp=class{constructor(e){this.id=IS++,this.code=e,this.usedTimes=0}};function DS(s){return s===Gn||s===Da||s===La}function LS(s,e,t,i,n,r){let a=new Fs,o=new np,l=new Set,c=[],h=new Map,d=i.logarithmicDepthBuffer,u=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(x){return l.add(x),x===0?"uv":`uv${x}`}function _(x,T,R,I,U,O){let D=I.fog,B=U.geometry,X=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,k=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,ne=e.get(x.envMap||X,k),q=ne&&ne.mapping===nr?ne.image.height:null,ee=f[x.type];x.precision!==null&&(u=i.getMaxPrecision(x.precision),u!==x.precision&&_e("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let $=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,H=$!==void 0?$.length:0,Q=0;B.morphAttributes.position!==void 0&&(Q=1),B.morphAttributes.normal!==void 0&&(Q=2),B.morphAttributes.color!==void 0&&(Q=3);let Ie,He,rt,K;if(ee){let St=cn[ee];Ie=St.vertexShader,He=St.fragmentShader}else{Ie=x.vertexShader,He=x.fragmentShader;let St=o.getVertexShaderStage(x),mt=o.getFragmentShaderStage(x);o.update(x,St,mt),rt=St.id,K=mt.id}let se=s.getRenderTarget(),me=s.state.buffers.depth.getReversed(),Ve=U.isInstancedMesh===!0,xe=U.isBatchedMesh===!0,Oe=!!x.map,at=!!x.matcap,te=!!ne,le=!!x.aoMap,ce=!!x.lightMap,he=!!x.bumpMap&&x.wireframe===!1,ge=!!x.normalMap,We=!!x.displacementMap,Ge=!!x.emissiveMap,Ke=!!x.metalnessMap,je=!!x.roughnessMap,L=x.anisotropy>0,pt=x.clearcoat>0,ot=x.dispersion>0,P=x.retroreflectivity>0,S=x.iridescence>0,z=x.sheen>0,W=x.transmission>0,J=L&&!!x.anisotropyMap,de=pt&&!!x.clearcoatMap,pe=pt&&!!x.clearcoatNormalMap,j=pt&&!!x.clearcoatRoughnessMap,re=S&&!!x.iridescenceMap,ve=S&&!!x.iridescenceThicknessMap,Be=z&&!!x.sheenColorMap,we=z&&!!x.sheenRoughnessMap,ye=!!x.specularMap,ze=!!x.specularColorMap,Xe=!!x.specularIntensityMap,Qe=W&&!!x.transmissionMap,F=W&&!!x.thicknessMap,Me=!!x.gradientMap,ie=!!x.alphaMap,be=x.alphaTest>0,Ce=!!x.alphaHash,oe=!!x.extensions,ke=Xi;x.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(ke=s.toneMapping);let Ne={shaderID:ee,shaderType:x.type,shaderName:x.name,vertexShader:Ie,fragmentShader:He,defines:x.defines,customVertexShaderID:rt,customFragmentShaderID:K,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:xe,batchingColor:xe&&U._colorsTexture!==null,instancing:Ve,instancingColor:Ve&&U.instanceColor!==null,instancingMorph:Ve&&U.morphTexture!==null,outputColorSpace:se===null?s.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:nt.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Oe,matcap:at,envMap:te,envMapMode:te&&ne.mapping,envMapCubeUVHeight:q,aoMap:le,lightMap:ce,bumpMap:he,normalMap:ge,displacementMap:We,emissiveMap:Ge,normalMapObjectSpace:ge&&x.normalMapType===If,normalMapTangentSpace:ge&&x.normalMapType===yn,packedNormalMap:ge&&x.normalMapType===yn&&DS(x.normalMap.format),metalnessMap:Ke,roughnessMap:je,anisotropy:L,anisotropyMap:J,clearcoat:pt,clearcoatMap:de,clearcoatNormalMap:pe,clearcoatRoughnessMap:j,dispersion:ot,retroreflection:P,iridescence:S,iridescenceMap:re,iridescenceThicknessMap:ve,sheen:z,sheenColorMap:Be,sheenRoughnessMap:we,specularMap:ye,specularColorMap:ze,specularIntensityMap:Xe,transmission:W,transmissionMap:Qe,thicknessMap:F,gradientMap:Me,opaque:x.transparent===!1&&x.blending===ir&&x.alphaToCoverage===!1,alphaMap:ie,alphaTest:be,alphaHash:Ce,combine:x.combine,mapUv:Oe&&p(x.map.channel),aoMapUv:le&&p(x.aoMap.channel),lightMapUv:ce&&p(x.lightMap.channel),bumpMapUv:he&&p(x.bumpMap.channel),normalMapUv:ge&&p(x.normalMap.channel),displacementMapUv:We&&p(x.displacementMap.channel),emissiveMapUv:Ge&&p(x.emissiveMap.channel),metalnessMapUv:Ke&&p(x.metalnessMap.channel),roughnessMapUv:je&&p(x.roughnessMap.channel),anisotropyMapUv:J&&p(x.anisotropyMap.channel),clearcoatMapUv:de&&p(x.clearcoatMap.channel),clearcoatNormalMapUv:pe&&p(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:j&&p(x.clearcoatRoughnessMap.channel),iridescenceMapUv:re&&p(x.iridescenceMap.channel),iridescenceThicknessMapUv:ve&&p(x.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&p(x.sheenColorMap.channel),sheenRoughnessMapUv:we&&p(x.sheenRoughnessMap.channel),specularMapUv:ye&&p(x.specularMap.channel),specularColorMapUv:ze&&p(x.specularColorMap.channel),specularIntensityMapUv:Xe&&p(x.specularIntensityMap.channel),transmissionMapUv:Qe&&p(x.transmissionMap.channel),thicknessMapUv:F&&p(x.thicknessMap.channel),alphaMapUv:ie&&p(x.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(ge||L),vertexNormals:!!B.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!B.attributes.uv&&(Oe||ie),fog:!!D,useFog:x.fog===!0,fogExp2:!!D&&D.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||B.attributes.normal===void 0&&ge===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:me,skinning:U.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:H,morphTextureStride:Q,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:s.shadowMap.enabled&&R.length>0,shadowMapType:s.shadowMap.type,toneMapping:ke,decodeVideoTexture:Oe&&x.map.isVideoTexture===!0&&nt.getTransfer(x.map.colorSpace)===ut,decodeVideoTextureEmissive:Ge&&x.emissiveMap.isVideoTexture===!0&&nt.getTransfer(x.emissiveMap.colorSpace)===ut,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===mi,flipSided:x.side===oi,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:oe&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(oe&&x.extensions.multiDraw===!0||xe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Ne.vertexUv1s=l.has(1),Ne.vertexUv2s=l.has(2),Ne.vertexUv3s=l.has(3),l.clear(),Ne}function g(x){let T=[];if(x.shaderID?T.push(x.shaderID):(T.push(x.customVertexShaderID),T.push(x.customFragmentShaderID)),x.defines!==void 0)for(let R in x.defines)T.push(R),T.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(m(T,x),y(T,x),T.push(s.outputColorSpace)),T.push(x.customProgramCacheKey),T.join()}function m(x,T){x.push(T.precision),x.push(T.outputColorSpace),x.push(T.envMapMode),x.push(T.envMapCubeUVHeight),x.push(T.mapUv),x.push(T.alphaMapUv),x.push(T.lightMapUv),x.push(T.aoMapUv),x.push(T.bumpMapUv),x.push(T.normalMapUv),x.push(T.displacementMapUv),x.push(T.emissiveMapUv),x.push(T.metalnessMapUv),x.push(T.roughnessMapUv),x.push(T.anisotropyMapUv),x.push(T.clearcoatMapUv),x.push(T.clearcoatNormalMapUv),x.push(T.clearcoatRoughnessMapUv),x.push(T.iridescenceMapUv),x.push(T.iridescenceThicknessMapUv),x.push(T.sheenColorMapUv),x.push(T.sheenRoughnessMapUv),x.push(T.specularMapUv),x.push(T.specularColorMapUv),x.push(T.specularIntensityMapUv),x.push(T.transmissionMapUv),x.push(T.thicknessMapUv),x.push(T.combine),x.push(T.fogExp2),x.push(T.sizeAttenuation),x.push(T.morphTargetsCount),x.push(T.morphAttributeCount),x.push(T.numSunLights),x.push(T.numDirLights),x.push(T.numPointLights),x.push(T.numSpotLights),x.push(T.numSpotLightMaps),x.push(T.numHemiLights),x.push(T.numRectAreaLights),x.push(T.numSunLightShadows),x.push(T.numDirLightShadows),x.push(T.numPointLightShadows),x.push(T.numSpotLightShadows),x.push(T.numSpotLightShadowsWithMaps),x.push(T.numLightProbes),x.push(T.shadowMapType),x.push(T.toneMapping),x.push(T.numClippingPlanes),x.push(T.numClipIntersection),x.push(T.depthPacking)}function y(x,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.retroreflection&&a.enable(24),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),x.push(a.mask)}function w(x){let T=f[x.type],R;if(T){let I=cn[T];R=bn.clone(I.uniforms)}else R=x.uniforms;return R}function v(x,T){let R=h.get(T);return R!==void 0?++R.usedTimes:(R=new PS(s,T,x,n),c.push(R),h.set(T,R)),R}function b(x){if(--x.usedTimes===0){let T=c.indexOf(x);c[T]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function M(x){o.remove(x)}function A(){o.dispose()}return{getParameters:_,getProgramCacheKey:g,getUniforms:w,acquireProgram:v,releaseProgram:b,releaseShaderCache:M,programs:c,dispose:A}}function NS(){let s=new WeakMap;function e(a){return s.has(a)}function t(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function i(a){s.delete(a)}function n(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:i,update:n,dispose:r}}function US(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.materialVariant!==e.materialVariant?s.materialVariant-e.materialVariant:s.z!==e.z?s.z-e.z:s.id-e.id}function g0(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function _0(){let s=[],e=0,t=[],i=[],n=[];function r(){e=0,t.length=0,i.length=0,n.length=0}function a(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,p,_,g,m){let y=s[e];return y===void 0?(y={id:u.id,object:u,geometry:f,material:p,materialVariant:a(u),groupOrder:_,renderOrder:u.renderOrder,z:g,group:m},s[e]=y):(y.id=u.id,y.object=u,y.geometry=f,y.material=p,y.materialVariant=a(u),y.groupOrder=_,y.renderOrder=u.renderOrder,y.z=g,y.group=m),e++,y}function l(u,f,p,_,g,m,y){y.reversedDepth===!0&&(g=-g);let w=o(u,f,p,_,g,m);p.transmission>0?i.push(w):p.transparent===!0?n.push(w):t.push(w)}function c(u,f,p,_,g,m){let y=o(u,f,p,_,g,m);p.transmission>0?i.unshift(y):p.transparent===!0?n.unshift(y):t.unshift(y)}function h(u,f){t.length>1&&t.sort(u||US),i.length>1&&i.sort(f||g0),n.length>1&&n.sort(f||g0)}function d(){for(let u=e,f=s.length;u<f;u++){let p=s[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:n,init:r,push:l,unshift:c,finish:d,sort:h}}function FS(){let s=new WeakMap;function e(i,n){let r=s.get(i),a;return r===void 0?(a=new _0,s.set(i,[a])):n>=r.length?(a=new _0,r.push(a)):a=r[n],a}function t(){s=new WeakMap}return{get:e,dispose:t}}function OS(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new C,color:new ae};break;case"SpotLight":t={position:new C,direction:new C,color:new ae,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new ae,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new ae,groundColor:new ae};break;case"RectAreaLight":t={color:new ae,position:new C,halfWidth:new C,halfHeight:new C};break}return s[e.id]=t,t}}}function BS(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Z};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Z};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Z,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}var zS=0;function kS(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function VS(s){let e=new OS,t=BS(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new C);let n=new C,r=new qe,a=new qe;function o(c){let h=0,d=0,u=0;for(let U=0;U<9;U++)i.probe[U].set(0,0,0);let f=0,p=0,_=0,g=0,m=0,y=0,w=0,v=0,b=0,M=0,A=0,x=0,T=0,R=0;c.sort(kS);for(let U=0,O=c.length;U<O;U++){let D=c[U],B=D.color,X=D.intensity,k=D.distance,ne=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===Gn?ne=D.shadow.map.texture:ne=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)h+=B.r*X,d+=B.g*X,u+=B.b*X;else if(D.isLightProbe){for(let q=0;q<9;q++)i.probe[q].addScaledVector(D.sh.coefficients[q],X);R++}else if(D.isSunLight){let q=e.get(D);if(q.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let ee=D.shadow,$=t.get(D);$.shadowIntensity=ee.intensity,$.shadowBias=ee.bias,$.shadowNormalBias=ee.normalBias,$.shadowRadius=ee.radius,$.shadowMapSize.copy(ee.mapSize).multiply(ee.getFrameExtents()),i.sunShadow[p]=$,i.sunShadowMap[p]=ne;let H=ee.getViewportCount();for(let Q=0;Q<H;Q++)i.sunShadowMatrix[_+Q]=ee.getMatrix(Q),i.sunShadowCascade[_+Q]=ee._cascadeData[Q];_+=H,p++}i.sun[f]=q,f++}else if(D.isDirectionalLight){let q=e.get(D);if(q.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let ee=D.shadow,$=t.get(D);$.shadowIntensity=ee.intensity,$.shadowBias=ee.bias,$.shadowNormalBias=ee.normalBias,$.shadowRadius=ee.radius,$.shadowMapSize=ee.mapSize,i.directionalShadow[g]=$,i.directionalShadowMap[g]=ne,i.directionalShadowMatrix[g]=D.shadow.matrix,b++}i.directional[g]=q,g++}else if(D.isSpotLight){let q=e.get(D);q.position.setFromMatrixPosition(D.matrixWorld),q.color.copy(B).multiplyScalar(X),q.distance=k,q.coneCos=Math.cos(D.angle),q.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),q.decay=D.decay,i.spot[y]=q;let ee=D.shadow;if(D.map&&(i.spotLightMap[x]=D.map,x++,ee.updateMatrices(D),D.castShadow&&T++),i.spotLightMatrix[y]=ee.matrix,D.castShadow){let $=t.get(D);$.shadowIntensity=ee.intensity,$.shadowBias=ee.bias,$.shadowNormalBias=ee.normalBias,$.shadowRadius=ee.radius,$.shadowMapSize=ee.mapSize,i.spotShadow[y]=$,i.spotShadowMap[y]=ne,A++}y++}else if(D.isRectAreaLight){let q=e.get(D);q.color.copy(B).multiplyScalar(X),q.halfWidth.set(D.width*.5,0,0),q.halfHeight.set(0,D.height*.5,0),i.rectArea[w]=q,w++}else if(D.isPointLight){let q=e.get(D);if(q.color.copy(D.color).multiplyScalar(D.intensity),q.distance=D.distance,q.decay=D.decay,D.castShadow){let ee=D.shadow,$=t.get(D);$.shadowIntensity=ee.intensity,$.shadowBias=ee.bias,$.shadowNormalBias=ee.normalBias,$.shadowRadius=ee.radius,$.shadowMapSize=ee.mapSize,$.shadowCameraNear=ee.camera.near,$.shadowCameraFar=ee.camera.far,i.pointShadow[m]=$,i.pointShadowMap[m]=ne,i.pointShadowMatrix[m]=D.shadow.matrix,M++}i.point[m]=q,m++}else if(D.isHemisphereLight){let q=e.get(D);q.skyColor.copy(D.color).multiplyScalar(X),q.groundColor.copy(D.groundColor).multiplyScalar(X),i.hemi[v]=q,v++}}w>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Se.LTC_FLOAT_1,i.rectAreaLTC2=Se.LTC_FLOAT_2):(i.rectAreaLTC1=Se.LTC_HALF_1,i.rectAreaLTC2=Se.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;let I=i.hash;(I.sunLength!==f||I.directionalLength!==g||I.pointLength!==m||I.spotLength!==y||I.rectAreaLength!==w||I.hemiLength!==v||I.numSunShadows!==p||I.numDirectionalShadows!==b||I.numPointShadows!==M||I.numSpotShadows!==A||I.numSpotMaps!==x||I.numLightProbes!==R)&&(i.sun.length=f,i.directional.length=g,i.spot.length=y,i.rectArea.length=w,i.point.length=m,i.hemi.length=v,i.sunShadow.length=p,i.sunShadowMap.length=p,i.sunShadowMatrix.length=_,i.sunShadowCascade.length=_,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.directionalShadowMatrix.length=b,i.pointShadow.length=M,i.pointShadowMap.length=M,i.pointShadowMatrix.length=M,i.spotShadow.length=A,i.spotShadowMap.length=A,i.spotLightMatrix.length=A+x-T,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=R,I.sunLength=f,I.directionalLength=g,I.pointLength=m,I.spotLength=y,I.rectAreaLength=w,I.hemiLength=v,I.numSunShadows=p,I.numDirectionalShadows=b,I.numPointShadows=M,I.numSpotShadows=A,I.numSpotMaps=x,I.numLightProbes=R,i.version=zS++)}function l(c,h){let d=0,u=0,f=0,p=0,_=0,g=0,m=h.matrixWorldInverse;for(let y=0,w=c.length;y<w;y++){let v=c[y];if(v.isSunLight){let b=i.sun[d];b.direction.setFromMatrixPosition(v.matrixWorld),b.direction.transformDirection(m),d++}else if(v.isDirectionalLight){let b=i.directional[u];b.direction.setFromMatrixPosition(v.matrixWorld),n.setFromMatrixPosition(v.target.matrixWorld),b.direction.sub(n),b.direction.transformDirection(m),u++}else if(v.isSpotLight){let b=i.spot[p];b.position.setFromMatrixPosition(v.matrixWorld),b.position.applyMatrix4(m),b.direction.setFromMatrixPosition(v.matrixWorld),n.setFromMatrixPosition(v.target.matrixWorld),b.direction.sub(n),b.direction.transformDirection(m),p++}else if(v.isRectAreaLight){let b=i.rectArea[_];b.position.setFromMatrixPosition(v.matrixWorld),b.position.applyMatrix4(m),a.identity(),r.copy(v.matrixWorld),r.premultiply(m),a.extractRotation(r),b.halfWidth.set(v.width*.5,0,0),b.halfHeight.set(0,v.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),_++}else if(v.isPointLight){let b=i.point[f];b.position.setFromMatrixPosition(v.matrixWorld),b.position.applyMatrix4(m),f++}else if(v.isHemisphereLight){let b=i.hemi[g];b.direction.setFromMatrixPosition(v.matrixWorld),b.direction.transformDirection(m),g++}}}return{setup:o,setupView:l,state:i}}function x0(s){let e=new VS(s),t=[],i=[],n=[];function r(u){d.camera=u,t.length=0,i.length=0,n.length=0}function a(u){t.push(u)}function o(u){i.push(u)}function l(u){n.push(u)}function c(){e.setup(t)}function h(u){e.setupView(t,u)}let d={lightsArray:t,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function GS(s){let e=new WeakMap;function t(n,r=0){let a=e.get(n),o;return a===void 0?(o=new x0(s),e.set(n,[o])):r>=a.length?(o=new x0(s),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}var HS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,WS=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,XS=[new C(1,0,0),new C(-1,0,0),new C(0,1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1)],qS=[new C(0,-1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1),new C(0,-1,0),new C(0,-1,0)],v0=new qe,lc=new C,$f=new C;function YS(s,e,t){let i=new pn,n=new Z,r=new Z,a=new xt,o=new ra,l=new aa,c={},h=t.maxTextureSize,d={[Bn]:oi,[oi]:Bn,[mi]:mi},u=new Rt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Z},radius:{value:4}},vertexShader:HS,fragmentShader:WS}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let p=new Ye;p.setAttribute("position",new ft(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new st(p,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ga;let m=this.type;this.render=function(M,A,x){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||M.length===0)return;this.type===rf&&(_e("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ga);let T=s.getRenderTarget(),R=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),U=s.state;U.setBlending(Pi),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let O=m!==this.type;O&&A.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(B=>B.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,B=M.length;D<B;D++){let X=M[D],k=X.shadow;if(k===void 0){_e("WebGLShadowMap:",X,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;n.copy(k.mapSize);let ne=k.getFrameExtents();n.multiply(ne),r.copy(k.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/ne.x),n.x=r.x*ne.x,k.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/ne.y),n.y=r.y*ne.y,k.mapSize.y=r.y));let q=s.state.buffers.depth.getReversed();if(k.camera._reversedDepth=q,k.map===null||O===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===tr){if(X.isPointLight){_e("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new Ct(n.x,n.y,{format:Gn,type:Jt,minFilter:Tt,magFilter:Tt,generateMipmaps:!1}),k.map.texture.name=X.name+".shadowMap",k.map.depthTexture=new Un(n.x,n.y,si),k.map.depthTexture.name=X.name+".shadowMapDepth",k.map.depthTexture.format=tn,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Dt,k.map.depthTexture.magFilter=Dt}else X.isPointLight?(k.map=new uc(n.x),k.map.depthTexture=new Do(n.x,Ii)):(k.map=new Ct(n.x,n.y),k.map.depthTexture=new Un(n.x,n.y,Ii)),k.map.depthTexture.name=X.name+".shadowMap",k.map.depthTexture.format=tn,this.type===ga?(k.map.depthTexture.compareFunction=q?rc:sc,k.map.depthTexture.minFilter=Tt,k.map.depthTexture.magFilter=Tt):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Dt,k.map.depthTexture.magFilter=Dt);k.camera.updateProjectionMatrix()}k.map.isWebGLCubeRenderTarget!==!0&&(k.map.width!==n.x||k.map.height!==n.y)&&k.map.setSize(n.x,n.y);let ee=k.map.isWebGLCubeRenderTarget?6:k.getViewportCount();X.isPointLight!==!0&&k.updateMatrices(X,x);for(let $=0;$<ee;$++){let H=k.getCamera($);if(X.isPointLight){let Q=k.camera,Ie=k.matrix,He=X.distance||Q.far;He!==Q.far&&(Q.far=He,Q.updateProjectionMatrix()),lc.setFromMatrixPosition(X.matrixWorld),Q.position.copy(lc),$f.copy(Q.position),$f.add(XS[$]),Q.up.copy(qS[$]),Q.lookAt($f),Q.updateMatrixWorld(),Ie.makeTranslation(-lc.x,-lc.y,-lc.z),v0.multiplyMatrices(Q.projectionMatrix,Q.matrixWorldInverse),k._frustum.setFromProjectionMatrix(v0,Q.coordinateSystem,Q.reversedDepth)}if(k.map.isWebGLCubeRenderTarget)s.setRenderTarget(k.map,$),s.clear();else{$===0&&(s.setRenderTarget(k.map),s.clear());let Q=k.getViewport($);a.set(r.x*Q.x,r.y*Q.y,r.x*Q.z,r.y*Q.w),U.viewport(a)}i=k.getFrustum($),v(A,x,H,X,this.type)}k.isPointLightShadow!==!0&&this.type===tr&&y(k,x),k.needsUpdate=!1}m=this.type,g.needsUpdate=!1,s.setRenderTarget(T,R,I)};function y(M,A){let x=e.update(_);u.defines.VSM_SAMPLES!==M.blurSamples&&(u.defines.VSM_SAMPLES=M.blurSamples,f.defines.VSM_SAMPLES=M.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),M.mapPass===null?M.mapPass=new Ct(n.x,n.y,{format:Gn,type:Jt}):(M.mapPass.width!==M.map.width||M.mapPass.height!==M.map.height)&&M.mapPass.setSize(M.map.width,M.map.height),u.uniforms.shadow_pass.value=M.map.depthTexture,u.uniforms.resolution.value.set(M.map.width,M.map.height),u.uniforms.radius.value=M.radius,s.setRenderTarget(M.mapPass),s.clear(),s.renderBufferDirect(A,null,x,u,_,null),f.uniforms.shadow_pass.value=M.mapPass.texture,f.uniforms.resolution.value.set(M.map.width,M.map.height),f.uniforms.radius.value=M.radius,s.setRenderTarget(M.map),s.clear(),s.renderBufferDirect(A,null,x,f,_,null)}function w(M,A,x,T){let R=null,I=x.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(I!==void 0)R=I;else if(R=x.isPointLight===!0?l:o,s.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let U=R.uuid,O=A.uuid,D=c[U];D===void 0&&(D={},c[U]=D);let B=D[O];B===void 0&&(B=R.clone(),D[O]=B,A.addEventListener("dispose",b)),R=B}if(R.visible=A.visible,R.wireframe=A.wireframe,T===tr?R.side=A.shadowSide!==null?A.shadowSide:A.side:R.side=A.shadowSide!==null?A.shadowSide:d[A.side],R.alphaMap=A.alphaMap,R.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,R.map=A.map,R.clipShadows=A.clipShadows,R.clippingPlanes=A.clippingPlanes,R.clipIntersection=A.clipIntersection,R.displacementMap=A.displacementMap,R.displacementScale=A.displacementScale,R.displacementBias=A.displacementBias,R.wireframeLinewidth=A.wireframeLinewidth,R.linewidth=A.linewidth,x.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let U=s.properties.get(R);U.light=x}return R}function v(M,A,x,T,R){if(M.visible===!1)return;if(M.layers.test(A.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&R===tr)&&(!M.frustumCulled||M.intersectsFrustum(i))){M.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,M.matrixWorld);let O=e.update(M),D=M.material;if(Array.isArray(D)){let B=O.groups;for(let X=0,k=B.length;X<k;X++){let ne=B[X],q=D[ne.materialIndex];if(q&&q.visible){let ee=w(M,q,T,R);M.onBeforeShadow(s,M,A,x,O,ee,ne),s.renderBufferDirect(x,null,O,ee,M,ne),M.onAfterShadow(s,M,A,x,O,ee,ne)}}}else if(D.visible){let B=w(M,D,T,R);M.onBeforeShadow(s,M,A,x,O,B,null),s.renderBufferDirect(x,null,O,B,M,null),M.onAfterShadow(s,M,A,x,O,B,null)}}let U=M.children;for(let O=0,D=U.length;O<D;O++)v(U[O],A,x,T,R)}function b(M){M.target.removeEventListener("dispose",b);for(let x in c){let T=c[x],R=M.target.uuid;R in T&&(T[R].dispose(),delete T[R])}}}function ZS(s,e){function t(){let F=!1,Me=new xt,ie=null,be=new xt(0,0,0,0);return{setMask:function(Ce){ie!==Ce&&!F&&(s.colorMask(Ce,Ce,Ce,Ce),ie=Ce)},setLocked:function(Ce){F=Ce},setClear:function(Ce,oe,ke,Ne,St){St===!0&&(Ce*=Ne,oe*=Ne,ke*=Ne),Me.set(Ce,oe,ke,Ne),be.equals(Me)===!1&&(s.clearColor(Ce,oe,ke,Ne),be.copy(Me))},reset:function(){F=!1,ie=null,be.set(-1,0,0,0)}}}function i(){let F=!1,Me=!1,ie=null,be=null,Ce=null;return{setReversed:function(oe){if(Me!==oe){let ke=e.get("EXT_clip_control");oe?ke.clipControlEXT(ke.LOWER_LEFT_EXT,ke.ZERO_TO_ONE_EXT):ke.clipControlEXT(ke.LOWER_LEFT_EXT,ke.NEGATIVE_ONE_TO_ONE_EXT),Me=oe;let Ne=Ce;Ce=null,this.setClear(Ne)}},getReversed:function(){return Me},setTest:function(oe){oe?se(s.DEPTH_TEST):me(s.DEPTH_TEST)},setMask:function(oe){ie!==oe&&!F&&(s.depthMask(oe),ie=oe)},setFunc:function(oe){if(Me&&(oe=Gg[oe]),be!==oe){switch(oe){case fo:s.depthFunc(s.NEVER);break;case po:s.depthFunc(s.ALWAYS);break;case mo:s.depthFunc(s.LESS);break;case Ds:s.depthFunc(s.LEQUAL);break;case go:s.depthFunc(s.EQUAL);break;case _o:s.depthFunc(s.GEQUAL);break;case xo:s.depthFunc(s.GREATER);break;case vo:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}be=oe}},setLocked:function(oe){F=oe},setClear:function(oe){Ce!==oe&&(Ce=oe,Me&&(oe=1-oe),s.clearDepth(oe))},reset:function(){F=!1,ie=null,be=null,Ce=null,Me=!1}}}function n(){let F=!1,Me=null,ie=null,be=null,Ce=null,oe=null,ke=null,Ne=null,St=null;return{setTest:function(mt){F||(mt?se(s.STENCIL_TEST):me(s.STENCIL_TEST))},setMask:function(mt){Me!==mt&&!F&&(s.stencilMask(mt),Me=mt)},setFunc:function(mt,Zi,hn){(ie!==mt||be!==Zi||Ce!==hn)&&(s.stencilFunc(mt,Zi,hn),ie=mt,be=Zi,Ce=hn)},setOp:function(mt,Zi,hn){(oe!==mt||ke!==Zi||Ne!==hn)&&(s.stencilOp(mt,Zi,hn),oe=mt,ke=Zi,Ne=hn)},setLocked:function(mt){F=mt},setClear:function(mt){St!==mt&&(s.clearStencil(mt),St=mt)},reset:function(){F=!1,Me=null,ie=null,be=null,Ce=null,oe=null,ke=null,Ne=null,St=null}}}let r=new t,a=new i,o=new n,l=new WeakMap,c=new WeakMap,h={},d={},u={},f=new WeakMap,p=[],_=null,g=!1,m=null,y=null,w=null,v=null,b=null,M=null,A=null,x=new ae(0,0,0),T=0,R=!1,I=null,U=null,O=null,D=null,B=null,X=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),k=!1,ne=0,q=s.getParameter(s.VERSION);q.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(q)[1]),k=ne>=1):q.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),k=ne>=2);let ee=null,$={},H=s.getParameter(s.SCISSOR_BOX),Q=s.getParameter(s.VIEWPORT),Ie=new xt().fromArray(H),He=new xt().fromArray(Q);function rt(F,Me,ie,be){let Ce=new Uint8Array(4),oe=s.createTexture();s.bindTexture(F,oe),s.texParameteri(F,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(F,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let ke=0;ke<ie;ke++)F===s.TEXTURE_3D||F===s.TEXTURE_2D_ARRAY?s.texImage3D(Me,0,s.RGBA,1,1,be,0,s.RGBA,s.UNSIGNED_BYTE,Ce):s.texImage2D(Me+ke,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Ce);return oe}let K={};K[s.TEXTURE_2D]=rt(s.TEXTURE_2D,s.TEXTURE_2D,1),K[s.TEXTURE_CUBE_MAP]=rt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[s.TEXTURE_2D_ARRAY]=rt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),K[s.TEXTURE_3D]=rt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),se(s.DEPTH_TEST),a.setFunc(Ds),he(!1),ge(mu),se(s.CULL_FACE),le(Pi);function se(F){h[F]!==!0&&(s.enable(F),h[F]=!0)}function me(F){h[F]!==!1&&(s.disable(F),h[F]=!1)}function Ve(F,Me){return u[F]!==Me?(s.bindFramebuffer(F,Me),u[F]=Me,F===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=Me),F===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=Me),!0):!1}function xe(F,Me){let ie=p,be=!1;if(F){ie=f.get(Me),ie===void 0&&(ie=[],f.set(Me,ie));let Ce=F.textures;if(ie.length!==Ce.length||ie[0]!==s.COLOR_ATTACHMENT0){for(let oe=0,ke=Ce.length;oe<ke;oe++)ie[oe]=s.COLOR_ATTACHMENT0+oe;ie.length=Ce.length,be=!0}}else ie[0]!==s.BACK&&(ie[0]=s.BACK,be=!0);be&&s.drawBuffers(ie)}function Oe(F){return _!==F?(s.useProgram(F),_=F,!0):!1}let at={[hs]:s.FUNC_ADD,[of]:s.FUNC_SUBTRACT,[lf]:s.FUNC_REVERSE_SUBTRACT};at[cf]=s.MIN,at[hf]=s.MAX;let te={[uf]:s.ZERO,[df]:s.ONE,[ff]:s.SRC_COLOR,[xu]:s.SRC_ALPHA,[vf]:s.SRC_ALPHA_SATURATE,[_f]:s.DST_COLOR,[mf]:s.DST_ALPHA,[pf]:s.ONE_MINUS_SRC_COLOR,[vu]:s.ONE_MINUS_SRC_ALPHA,[xf]:s.ONE_MINUS_DST_COLOR,[gf]:s.ONE_MINUS_DST_ALPHA,[yf]:s.CONSTANT_COLOR,[Mf]:s.ONE_MINUS_CONSTANT_COLOR,[bf]:s.CONSTANT_ALPHA,[Sf]:s.ONE_MINUS_CONSTANT_ALPHA};function le(F,Me,ie,be,Ce,oe,ke,Ne,St,mt){if(F===Pi){g===!0&&(me(s.BLEND),g=!1);return}if(g===!1&&(se(s.BLEND),g=!0),F!==af){if(F!==m||mt!==R){if((y!==hs||b!==hs)&&(s.blendEquation(s.FUNC_ADD),y=hs,b=hs),mt)switch(F){case ir:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case zn:s.blendFunc(s.ONE,s.ONE);break;case gu:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case _u:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Ue("WebGLState: Invalid blending: ",F);break}else switch(F){case ir:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case zn:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case gu:Ue("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case _u:Ue("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ue("WebGLState: Invalid blending: ",F);break}w=null,v=null,M=null,A=null,x.set(0,0,0),T=0,m=F,R=mt}return}Ce=Ce||Me,oe=oe||ie,ke=ke||be,(Me!==y||Ce!==b)&&(s.blendEquationSeparate(at[Me],at[Ce]),y=Me,b=Ce),(ie!==w||be!==v||oe!==M||ke!==A)&&(s.blendFuncSeparate(te[ie],te[be],te[oe],te[ke]),w=ie,v=be,M=oe,A=ke),(Ne.equals(x)===!1||St!==T)&&(s.blendColor(Ne.r,Ne.g,Ne.b,St),x.copy(Ne),T=St),m=F,R=!1}function ce(F,Me){F.side===mi?me(s.CULL_FACE):se(s.CULL_FACE);let ie=F.side===oi;Me&&(ie=!ie),he(ie),F.blending===ir&&F.transparent===!1?le(Pi):le(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),a.setFunc(F.depthFunc),a.setTest(F.depthTest),a.setMask(F.depthWrite),r.setMask(F.colorWrite);let be=F.stencilWrite;o.setTest(be),be&&(o.setMask(F.stencilWriteMask),o.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),o.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Ge(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?se(s.SAMPLE_ALPHA_TO_COVERAGE):me(s.SAMPLE_ALPHA_TO_COVERAGE)}function he(F){I!==F&&(F?s.frontFace(s.CW):s.frontFace(s.CCW),I=F)}function ge(F){F!==nf?(se(s.CULL_FACE),F!==U&&(F===mu?s.cullFace(s.BACK):F===sf?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):me(s.CULL_FACE),U=F}function We(F){F!==O&&(k&&s.lineWidth(F),O=F)}function Ge(F,Me,ie){F?(se(s.POLYGON_OFFSET_FILL),(D!==Me||B!==ie)&&(D=Me,B=ie,a.getReversed()&&(Me=-Me),s.polygonOffset(Me,ie))):me(s.POLYGON_OFFSET_FILL)}function Ke(F){F?se(s.SCISSOR_TEST):me(s.SCISSOR_TEST)}function je(F){F===void 0&&(F=s.TEXTURE0+X-1),ee!==F&&(s.activeTexture(F),ee=F)}function L(F,Me,ie){ie===void 0&&(ee===null?ie=s.TEXTURE0+X-1:ie=ee);let be=$[ie];be===void 0&&(be={type:void 0,texture:void 0},$[ie]=be),(be.type!==F||be.texture!==Me)&&(ee!==ie&&(s.activeTexture(ie),ee=ie),s.bindTexture(F,Me||K[F]),be.type=F,be.texture=Me)}function pt(){let F=$[ee];F!==void 0&&F.type!==void 0&&(s.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function ot(){try{s.compressedTexImage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function P(){try{s.compressedTexImage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function S(){try{s.texSubImage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function z(){try{s.texSubImage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function W(){try{s.compressedTexSubImage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function J(){try{s.compressedTexSubImage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function de(){try{s.texStorage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function pe(){try{s.texStorage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function j(){try{s.texImage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function re(){try{s.texImage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function ve(F){return d[F]!==void 0?d[F]:s.getParameter(F)}function Be(F,Me){d[F]!==Me&&(s.pixelStorei(F,Me),d[F]=Me)}function we(F){Ie.equals(F)===!1&&(s.scissor(F.x,F.y,F.z,F.w),Ie.copy(F))}function ye(F){He.equals(F)===!1&&(s.viewport(F.x,F.y,F.z,F.w),He.copy(F))}function ze(F,Me){let ie=c.get(Me);ie===void 0&&(ie=new WeakMap,c.set(Me,ie));let be=ie.get(F);be===void 0&&(be=s.getUniformBlockIndex(Me,F.name),ie.set(F,be))}function Xe(F,Me){let be=c.get(Me).get(F);l.get(Me)!==be&&(s.uniformBlockBinding(Me,be,F.__bindingPointIndex),l.set(Me,be))}function Qe(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},d={},ee=null,$={},u={},f=new WeakMap,p=[],_=null,g=!1,m=null,y=null,w=null,v=null,b=null,M=null,A=null,x=new ae(0,0,0),T=0,R=!1,I=null,U=null,O=null,D=null,B=null,Ie.set(0,0,s.canvas.width,s.canvas.height),He.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:se,disable:me,bindFramebuffer:Ve,drawBuffers:xe,useProgram:Oe,setBlending:le,setMaterial:ce,setFlipSided:he,setCullFace:ge,setLineWidth:We,setPolygonOffset:Ge,setScissorTest:Ke,activeTexture:je,bindTexture:L,unbindTexture:pt,compressedTexImage2D:ot,compressedTexImage3D:P,texImage2D:j,texImage3D:re,pixelStorei:Be,getParameter:ve,updateUBOMapping:ze,uniformBlockBinding:Xe,texStorage2D:de,texStorage3D:pe,texSubImage2D:S,texSubImage3D:z,compressedTexSubImage2D:W,compressedTexSubImage3D:J,scissor:we,viewport:ye,reset:Qe}}function KS(s,e,t,i,n,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Z,h=new WeakMap,d=new Set,u,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(P,S){return p?new OffscreenCanvas(P,S):Hr("canvas")}function g(P,S,z){let W=1,J=ot(P);if((J.width>z||J.height>z)&&(W=z/Math.max(J.width,J.height)),W<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){let de=Math.floor(W*J.width),pe=Math.floor(W*J.height);u===void 0&&(u=_(de,pe));let j=S?_(de,pe):u;return j.width=de,j.height=pe,j.getContext("2d").drawImage(P,0,0,de,pe),_e("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+de+"x"+pe+")."),j}else return"data"in P&&_e("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),P;return P}function m(P){return P.generateMipmaps}function y(P){s.generateMipmap(P)}function w(P){return P.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?s.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function v(P,S,z,W,J,de=!1){if(P!==null){if(s[P]!==void 0)return s[P];_e("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let pe;W&&(pe=e.get("EXT_texture_norm16"),pe||_e("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let j=S;if(S===s.RED&&(z===s.FLOAT&&(j=s.R32F),z===s.HALF_FLOAT&&(j=s.R16F),z===s.UNSIGNED_BYTE&&(j=s.R8),z===s.UNSIGNED_SHORT&&pe&&(j=pe.R16_EXT),z===s.SHORT&&pe&&(j=pe.R16_SNORM_EXT)),S===s.RED_INTEGER&&(z===s.UNSIGNED_BYTE&&(j=s.R8UI),z===s.UNSIGNED_SHORT&&(j=s.R16UI),z===s.UNSIGNED_INT&&(j=s.R32UI),z===s.BYTE&&(j=s.R8I),z===s.SHORT&&(j=s.R16I),z===s.INT&&(j=s.R32I)),S===s.RG&&(z===s.FLOAT&&(j=s.RG32F),z===s.HALF_FLOAT&&(j=s.RG16F),z===s.UNSIGNED_BYTE&&(j=s.RG8),z===s.UNSIGNED_SHORT&&pe&&(j=pe.RG16_EXT),z===s.SHORT&&pe&&(j=pe.RG16_SNORM_EXT)),S===s.RG_INTEGER&&(z===s.UNSIGNED_BYTE&&(j=s.RG8UI),z===s.UNSIGNED_SHORT&&(j=s.RG16UI),z===s.UNSIGNED_INT&&(j=s.RG32UI),z===s.BYTE&&(j=s.RG8I),z===s.SHORT&&(j=s.RG16I),z===s.INT&&(j=s.RG32I)),S===s.RGB_INTEGER&&(z===s.UNSIGNED_BYTE&&(j=s.RGB8UI),z===s.UNSIGNED_SHORT&&(j=s.RGB16UI),z===s.UNSIGNED_INT&&(j=s.RGB32UI),z===s.BYTE&&(j=s.RGB8I),z===s.SHORT&&(j=s.RGB16I),z===s.INT&&(j=s.RGB32I)),S===s.RGBA_INTEGER&&(z===s.UNSIGNED_BYTE&&(j=s.RGBA8UI),z===s.UNSIGNED_SHORT&&(j=s.RGBA16UI),z===s.UNSIGNED_INT&&(j=s.RGBA32UI),z===s.BYTE&&(j=s.RGBA8I),z===s.SHORT&&(j=s.RGBA16I),z===s.INT&&(j=s.RGBA32I)),S===s.RGB&&(z===s.UNSIGNED_SHORT&&pe&&(j=pe.RGB16_EXT),z===s.SHORT&&pe&&(j=pe.RGB16_SNORM_EXT),z===s.UNSIGNED_INT_5_9_9_9_REV&&(j=s.RGB9_E5),z===s.UNSIGNED_INT_10F_11F_11F_REV&&(j=s.R11F_G11F_B10F)),S===s.RGBA){let re=de?Gr:nt.getTransfer(J);z===s.FLOAT&&(j=s.RGBA32F),z===s.HALF_FLOAT&&(j=s.RGBA16F),z===s.UNSIGNED_BYTE&&(j=re===ut?s.SRGB8_ALPHA8:s.RGBA8),z===s.UNSIGNED_SHORT&&pe&&(j=pe.RGBA16_EXT),z===s.SHORT&&pe&&(j=pe.RGBA16_SNORM_EXT),z===s.UNSIGNED_SHORT_4_4_4_4&&(j=s.RGBA4),z===s.UNSIGNED_SHORT_5_5_5_1&&(j=s.RGB5_A1)}return(j===s.R16F||j===s.R32F||j===s.RG16F||j===s.RG32F||j===s.RGBA16F||j===s.RGBA32F)&&e.get("EXT_color_buffer_float"),j}function b(P,S){let z;return P?S===null||S===Ii||S===ar?z=s.DEPTH24_STENCIL8:S===si?z=s.DEPTH32F_STENCIL8:S===rr&&(z=s.DEPTH24_STENCIL8,_e("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Ii||S===ar?z=s.DEPTH_COMPONENT24:S===si?z=s.DEPTH_COMPONENT32F:S===rr&&(z=s.DEPTH_COMPONENT16),z}function M(P,S){return m(P)===!0||P.isFramebufferTexture&&P.minFilter!==Dt&&P.minFilter!==Tt?Math.log2(Math.max(S.width,S.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?S.mipmaps.length:1}function A(P){let S=P.target;S.removeEventListener("dispose",A),T(S),S.isVideoTexture&&h.delete(S),S.isHTMLTexture&&d.delete(S)}function x(P){let S=P.target;S.removeEventListener("dispose",x),I(S)}function T(P){let S=i.get(P);if(S.__webglInit===void 0)return;let z=P.source,W=f.get(z);if(W){let J=W[S.__cacheKey];J.usedTimes--,J.usedTimes===0&&R(P),Object.keys(W).length===0&&f.delete(z)}i.remove(P)}function R(P){let S=i.get(P);s.deleteTexture(S.__webglTexture);let z=P.source,W=f.get(z);delete W[S.__cacheKey],a.memory.textures--}function I(P){let S=i.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),i.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(S.__webglFramebuffer[W]))for(let J=0;J<S.__webglFramebuffer[W].length;J++)s.deleteFramebuffer(S.__webglFramebuffer[W][J]);else s.deleteFramebuffer(S.__webglFramebuffer[W]);S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer[W])}else{if(Array.isArray(S.__webglFramebuffer))for(let W=0;W<S.__webglFramebuffer.length;W++)s.deleteFramebuffer(S.__webglFramebuffer[W]);else s.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&s.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let W=0;W<S.__webglColorRenderbuffer.length;W++)S.__webglColorRenderbuffer[W]&&s.deleteRenderbuffer(S.__webglColorRenderbuffer[W]);S.__webglDepthRenderbuffer&&s.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let z=P.textures;for(let W=0,J=z.length;W<J;W++){let de=i.get(z[W]);de.__webglTexture&&(s.deleteTexture(de.__webglTexture),a.memory.textures--),i.remove(z[W])}i.remove(P)}let U=0;function O(){U=0}function D(){return U}function B(P){U=P}function X(){let P=U;return P>=n.maxTextures&&_e("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+n.maxTextures),U+=1,P}function k(P){let S=[];return S.push(P.wrapS),S.push(P.wrapT),S.push(P.wrapR||0),S.push(P.magFilter),S.push(P.minFilter),S.push(P.anisotropy),S.push(P.internalFormat),S.push(P.format),S.push(P.type),S.push(P.generateMipmaps),S.push(P.premultiplyAlpha),S.push(P.flipY),S.push(P.unpackAlignment),S.push(P.colorSpace),S.join()}function ne(P,S){let z=i.get(P);if(P.isVideoTexture&&L(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&z.__version!==P.version){let W=P.image;if(W===null)_e("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)_e("WebGLRenderer: Texture marked for update but image is incomplete");else{me(z,P,S);return}}else P.isExternalTexture&&(z.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,z.__webglTexture,s.TEXTURE0+S)}function q(P,S){let z=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&z.__version!==P.version){me(z,P,S);return}else P.isExternalTexture&&(z.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,z.__webglTexture,s.TEXTURE0+S)}function ee(P,S){let z=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&z.__version!==P.version){me(z,P,S);return}t.bindTexture(s.TEXTURE_3D,z.__webglTexture,s.TEXTURE0+S)}function $(P,S){let z=i.get(P);if(P.isCubeDepthTexture!==!0&&P.version>0&&z.__version!==P.version){Ve(z,P,S);return}t.bindTexture(s.TEXTURE_CUBE_MAP,z.__webglTexture,s.TEXTURE0+S)}let H={[Or]:s.REPEAT,[di]:s.CLAMP_TO_EDGE,[Br]:s.MIRRORED_REPEAT},Q={[Dt]:s.NEAREST,[yu]:s.NEAREST_MIPMAP_NEAREST,[sr]:s.NEAREST_MIPMAP_LINEAR,[Tt]:s.LINEAR,[Ea]:s.LINEAR_MIPMAP_NEAREST,[ln]:s.LINEAR_MIPMAP_LINEAR},Ie={[Lf]:s.NEVER,[Bf]:s.ALWAYS,[Nf]:s.LESS,[sc]:s.LEQUAL,[Uf]:s.EQUAL,[rc]:s.GEQUAL,[Ff]:s.GREATER,[Of]:s.NOTEQUAL};function He(P,S){if(S.type===si&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===Tt||S.magFilter===Ea||S.magFilter===sr||S.magFilter===ln||S.minFilter===Tt||S.minFilter===Ea||S.minFilter===sr||S.minFilter===ln)&&_e("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(P,s.TEXTURE_WRAP_S,H[S.wrapS]),s.texParameteri(P,s.TEXTURE_WRAP_T,H[S.wrapT]),(P===s.TEXTURE_3D||P===s.TEXTURE_2D_ARRAY)&&s.texParameteri(P,s.TEXTURE_WRAP_R,H[S.wrapR]),s.texParameteri(P,s.TEXTURE_MAG_FILTER,Q[S.magFilter]),s.texParameteri(P,s.TEXTURE_MIN_FILTER,Q[S.minFilter]),S.compareFunction&&(s.texParameteri(P,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(P,s.TEXTURE_COMPARE_FUNC,Ie[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Dt||S.minFilter!==sr&&S.minFilter!==ln||S.type===si&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){let z=e.get("EXT_texture_filter_anisotropic");s.texParameterf(P,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,n.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function rt(P,S){let z=!1;P.__webglInit===void 0&&(P.__webglInit=!0,S.addEventListener("dispose",A));let W=S.source,J=f.get(W);J===void 0&&(J={},f.set(W,J));let de=k(S);if(de!==P.__cacheKey){J[de]===void 0&&(J[de]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,z=!0),J[de].usedTimes++;let pe=J[P.__cacheKey];pe!==void 0&&(J[P.__cacheKey].usedTimes--,pe.usedTimes===0&&R(S)),P.__cacheKey=de,P.__webglTexture=J[de].texture}return z}function K(P,S,z){return Math.floor(Math.floor(P/z)/S)}function se(P,S,z,W){let de=P.updateRanges;if(de.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,S.width,S.height,z,W,S.data);else{de.sort((Be,we)=>Be.start-we.start);let pe=0;for(let Be=1;Be<de.length;Be++){let we=de[pe],ye=de[Be],ze=we.start+we.count,Xe=K(ye.start,S.width,4),Qe=K(we.start,S.width,4);ye.start<=ze+1&&Xe===Qe&&K(ye.start+ye.count-1,S.width,4)===Xe?we.count=Math.max(we.count,ye.start+ye.count-we.start):(++pe,de[pe]=ye)}de.length=pe+1;let j=t.getParameter(s.UNPACK_ROW_LENGTH),re=t.getParameter(s.UNPACK_SKIP_PIXELS),ve=t.getParameter(s.UNPACK_SKIP_ROWS);t.pixelStorei(s.UNPACK_ROW_LENGTH,S.width);for(let Be=0,we=de.length;Be<we;Be++){let ye=de[Be],ze=Math.floor(ye.start/4),Xe=Math.ceil(ye.count/4),Qe=ze%S.width,F=Math.floor(ze/S.width),Me=Xe,ie=1;t.pixelStorei(s.UNPACK_SKIP_PIXELS,Qe),t.pixelStorei(s.UNPACK_SKIP_ROWS,F),t.texSubImage2D(s.TEXTURE_2D,0,Qe,F,Me,ie,z,W,S.data)}P.clearUpdateRanges(),t.pixelStorei(s.UNPACK_ROW_LENGTH,j),t.pixelStorei(s.UNPACK_SKIP_PIXELS,re),t.pixelStorei(s.UNPACK_SKIP_ROWS,ve)}}function me(P,S,z){let W=s.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(W=s.TEXTURE_2D_ARRAY),S.isData3DTexture&&(W=s.TEXTURE_3D);let J=rt(P,S),de=S.source;t.bindTexture(W,P.__webglTexture,s.TEXTURE0+z);let pe=i.get(de);if(de.version!==pe.__version||J===!0){if(t.activeTexture(s.TEXTURE0+z),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){let ie=nt.getPrimaries(nt.workingColorSpace),be=S.colorSpace===Mn?null:nt.getPrimaries(S.colorSpace),Ce=S.colorSpace===Mn||ie===be?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce)}t.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment);let re=g(S.image,!1,n.maxTextureSize);re=pt(S,re);let ve=r.convert(S.format,S.colorSpace),Be=r.convert(S.type),we=v(S.internalFormat,ve,Be,S.normalized,S.colorSpace,S.isVideoTexture);He(W,S);let ye,ze=S.mipmaps,Xe=S.isVideoTexture!==!0,Qe=pe.__version===void 0||J===!0,F=de.dataReady,Me=M(S,re);if(S.isDepthTexture)we=b(S.format===Vn,S.type),Qe&&(Xe?t.texStorage2D(s.TEXTURE_2D,1,we,re.width,re.height):t.texImage2D(s.TEXTURE_2D,0,we,re.width,re.height,0,ve,Be,null));else if(S.isDataTexture)if(ze.length>0){Xe&&Qe&&t.texStorage2D(s.TEXTURE_2D,Me,we,ze[0].width,ze[0].height);for(let ie=0,be=ze.length;ie<be;ie++)ye=ze[ie],Xe?F&&t.texSubImage2D(s.TEXTURE_2D,ie,0,0,ye.width,ye.height,ve,Be,ye.data):t.texImage2D(s.TEXTURE_2D,ie,we,ye.width,ye.height,0,ve,Be,ye.data);S.generateMipmaps=!1}else Xe?(Qe&&t.texStorage2D(s.TEXTURE_2D,Me,we,re.width,re.height),F&&se(S,re,ve,Be)):t.texImage2D(s.TEXTURE_2D,0,we,re.width,re.height,0,ve,Be,re.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Xe&&Qe&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Me,we,ze[0].width,ze[0].height,re.depth);for(let ie=0,be=ze.length;ie<be;ie++)if(ye=ze[ie],S.format!==ri)if(ve!==null)if(Xe){if(F)if(S.layerUpdates.size>0){let Ce=Ru(ye.width,ye.height,S.format,S.type);for(let oe of S.layerUpdates){let ke=ye.data.subarray(oe*Ce/ye.data.BYTES_PER_ELEMENT,(oe+1)*Ce/ye.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ie,0,0,oe,ye.width,ye.height,1,ve,ke)}}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ie,0,0,0,ye.width,ye.height,re.depth,ve,ye.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ie,we,ye.width,ye.height,re.depth,0,ye.data,0,0);else _e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Xe?F&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,ie,0,0,0,ye.width,ye.height,re.depth,ve,Be,ye.data):t.texImage3D(s.TEXTURE_2D_ARRAY,ie,we,ye.width,ye.height,re.depth,0,ve,Be,ye.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{Xe&&Qe&&t.texStorage2D(s.TEXTURE_2D,Me,we,ze[0].width,ze[0].height);for(let ie=0,be=ze.length;ie<be;ie++)ye=ze[ie],S.format!==ri?ve!==null?Xe?F&&t.compressedTexSubImage2D(s.TEXTURE_2D,ie,0,0,ye.width,ye.height,ve,ye.data):t.compressedTexImage2D(s.TEXTURE_2D,ie,we,ye.width,ye.height,0,ye.data):_e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xe?F&&t.texSubImage2D(s.TEXTURE_2D,ie,0,0,ye.width,ye.height,ve,Be,ye.data):t.texImage2D(s.TEXTURE_2D,ie,we,ye.width,ye.height,0,ve,Be,ye.data)}else if(S.isDataArrayTexture)if(Xe){if(Qe&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Me,we,re.width,re.height,re.depth),F)if(S.layerUpdates.size>0){let ie=Ru(re.width,re.height,S.format,S.type);for(let be of S.layerUpdates){let Ce=re.data.subarray(be*ie/re.data.BYTES_PER_ELEMENT,(be+1)*ie/re.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,be,re.width,re.height,1,ve,Be,Ce)}S.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,ve,Be,re.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,we,re.width,re.height,re.depth,0,ve,Be,re.data);else if(S.isData3DTexture)Xe?(Qe&&t.texStorage3D(s.TEXTURE_3D,Me,we,re.width,re.height,re.depth),F&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,ve,Be,re.data)):t.texImage3D(s.TEXTURE_3D,0,we,re.width,re.height,re.depth,0,ve,Be,re.data);else if(S.isFramebufferTexture){if(Qe)if(Xe)t.texStorage2D(s.TEXTURE_2D,Me,we,re.width,re.height);else{let ie=re.width,be=re.height;for(let Ce=0;Ce<Me;Ce++)t.texImage2D(s.TEXTURE_2D,Ce,we,ie,be,0,ve,Be,null),ie>>=1,be>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in s){let ie=s.canvas;if(ie.hasAttribute("layoutsubtree")||ie.setAttribute("layoutsubtree","true"),re.parentNode!==ie){ie.appendChild(re),d.add(S),ie.onpaint=be=>{let Ce=be.changedElements;for(let oe of d)Ce.includes(oe.image)&&(oe.needsUpdate=!0)},ie.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,re);else{let Ce=s.RGBA,oe=s.RGBA,ke=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,Ce,oe,ke,re)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(ze.length>0){if(Xe&&Qe){let ie=ot(ze[0]);t.texStorage2D(s.TEXTURE_2D,Me,we,ie.width,ie.height)}for(let ie=0,be=ze.length;ie<be;ie++)ye=ze[ie],Xe?F&&t.texSubImage2D(s.TEXTURE_2D,ie,0,0,ve,Be,ye):t.texImage2D(s.TEXTURE_2D,ie,we,ve,Be,ye);S.generateMipmaps=!1}else if(Xe){if(Qe){let ie=ot(re);t.texStorage2D(s.TEXTURE_2D,Me,we,ie.width,ie.height)}F&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ve,Be,re)}else t.texImage2D(s.TEXTURE_2D,0,we,ve,Be,re);m(S)&&y(W),pe.__version=de.version,S.onUpdate&&S.onUpdate(S)}P.__version=S.version}function Ve(P,S,z){if(S.image.length!==6)return;let W=rt(P,S),J=S.source;t.bindTexture(s.TEXTURE_CUBE_MAP,P.__webglTexture,s.TEXTURE0+z);let de=i.get(J);if(J.version!==de.__version||W===!0){t.activeTexture(s.TEXTURE0+z);let pe=nt.getPrimaries(nt.workingColorSpace),j=S.colorSpace===Mn?null:nt.getPrimaries(S.colorSpace),re=S.colorSpace===Mn||pe===j?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,re);let ve=S.isCompressedTexture||S.image[0].isCompressedTexture,Be=S.image[0]&&S.image[0].isDataTexture,we=[];for(let oe=0;oe<6;oe++)!ve&&!Be?we[oe]=g(S.image[oe],!0,n.maxCubemapSize):we[oe]=Be?S.image[oe].image:S.image[oe],we[oe]=pt(S,we[oe]);let ye=we[0],ze=r.convert(S.format,S.colorSpace),Xe=r.convert(S.type),Qe=v(S.internalFormat,ze,Xe,S.normalized,S.colorSpace),F=S.isVideoTexture!==!0,Me=de.__version===void 0||W===!0,ie=J.dataReady,be=M(S,ye);He(s.TEXTURE_CUBE_MAP,S);let Ce;if(ve){F&&Me&&t.texStorage2D(s.TEXTURE_CUBE_MAP,be,Qe,ye.width,ye.height);for(let oe=0;oe<6;oe++){Ce=we[oe].mipmaps;for(let ke=0;ke<Ce.length;ke++){let Ne=Ce[ke];S.format!==ri?ze!==null?F?ie&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ke,0,0,Ne.width,Ne.height,ze,Ne.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ke,Qe,Ne.width,Ne.height,0,Ne.data):_e("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ke,0,0,Ne.width,Ne.height,ze,Xe,Ne.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ke,Qe,Ne.width,Ne.height,0,ze,Xe,Ne.data)}}}else{if(Ce=S.mipmaps,F&&Me){Ce.length>0&&be++;let oe=ot(we[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,be,Qe,oe.width,oe.height)}for(let oe=0;oe<6;oe++)if(Be){F?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,0,0,we[oe].width,we[oe].height,ze,Xe,we[oe].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,Qe,we[oe].width,we[oe].height,0,ze,Xe,we[oe].data);for(let ke=0;ke<Ce.length;ke++){let St=Ce[ke].image[oe].image;F?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ke+1,0,0,St.width,St.height,ze,Xe,St.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ke+1,Qe,St.width,St.height,0,ze,Xe,St.data)}}else{F?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,0,0,ze,Xe,we[oe]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,Qe,ze,Xe,we[oe]);for(let ke=0;ke<Ce.length;ke++){let Ne=Ce[ke];F?ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ke+1,0,0,ze,Xe,Ne.image[oe]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ke+1,Qe,ze,Xe,Ne.image[oe])}}}m(S)&&y(s.TEXTURE_CUBE_MAP),de.__version=J.version,S.onUpdate&&S.onUpdate(S)}P.__version=S.version}function xe(P,S,z,W,J,de){let pe=r.convert(z.format,z.colorSpace),j=r.convert(z.type),re=v(z.internalFormat,pe,j,z.normalized,z.colorSpace),ve=i.get(S),Be=i.get(z);if(Be.__renderTarget=S,!ve.__hasExternalTextures){let we=Math.max(1,S.width>>de),ye=Math.max(1,S.height>>de);J===s.TEXTURE_3D||J===s.TEXTURE_2D_ARRAY?t.texImage3D(J,de,re,we,ye,S.depth,0,pe,j,null):t.texImage2D(J,de,re,we,ye,0,pe,j,null)}t.bindFramebuffer(s.FRAMEBUFFER,P),je(S)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,W,J,Be.__webglTexture,0,Ke(S)):(J===s.TEXTURE_2D||J>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,W,J,Be.__webglTexture,de),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Oe(P,S,z){if(s.bindRenderbuffer(s.RENDERBUFFER,P),S.depthBuffer){let W=S.depthTexture,J=W&&W.isDepthTexture?W.type:null,de=b(S.stencilBuffer,J),pe=S.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;je(S)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ke(S),de,S.width,S.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ke(S),de,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,de,S.width,S.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,pe,s.RENDERBUFFER,P)}else{let W=S.textures;for(let J=0;J<W.length;J++){let de=W[J],pe=r.convert(de.format,de.colorSpace),j=r.convert(de.type),re=v(de.internalFormat,pe,j,de.normalized,de.colorSpace);je(S)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ke(S),re,S.width,S.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ke(S),re,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,re,S.width,S.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function at(P,S,z){let W=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,P),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let J=i.get(S.depthTexture);if(J.__renderTarget=S,(!J.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),W){if(J.__webglInit===void 0&&(J.__webglInit=!0,S.depthTexture.addEventListener("dispose",A)),J.__webglTexture===void 0){J.__webglTexture=s.createTexture(),t.bindTexture(s.TEXTURE_CUBE_MAP,J.__webglTexture),He(s.TEXTURE_CUBE_MAP,S.depthTexture);let ve=r.convert(S.depthTexture.format),Be=r.convert(S.depthTexture.type),we;S.depthTexture.format===tn?we=s.DEPTH_COMPONENT24:S.depthTexture.format===Vn&&(we=s.DEPTH24_STENCIL8);for(let ye=0;ye<6;ye++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,we,S.width,S.height,0,ve,Be,null)}}else ne(S.depthTexture,0);let de=J.__webglTexture,pe=Ke(S),j=W?s.TEXTURE_CUBE_MAP_POSITIVE_X+z:s.TEXTURE_2D,re=S.depthTexture.format===Vn?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(S.depthTexture.format===tn)je(S)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,re,j,de,0,pe):s.framebufferTexture2D(s.FRAMEBUFFER,re,j,de,0);else if(S.depthTexture.format===Vn)je(S)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,re,j,de,0,pe):s.framebufferTexture2D(s.FRAMEBUFFER,re,j,de,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function te(P){let S=i.get(P),z=P.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==P.depthTexture){let W=P.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),W){let J=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,W.removeEventListener("dispose",J)};W.addEventListener("dispose",J),S.__depthDisposeCallback=J}S.__boundDepthTexture=W}if(P.depthTexture&&!S.__autoAllocateDepthBuffer)if(z)for(let W=0;W<6;W++)at(S.__webglFramebuffer[W],P,W);else{let W=P.texture.mipmaps;W&&W.length>0?at(S.__webglFramebuffer[0],P,0):at(S.__webglFramebuffer,P,0)}else if(z){S.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer[W]),S.__webglDepthbuffer[W]===void 0)S.__webglDepthbuffer[W]=s.createRenderbuffer(),Oe(S.__webglDepthbuffer[W],P,!1);else{let J=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,de=S.__webglDepthbuffer[W];s.bindRenderbuffer(s.RENDERBUFFER,de),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,de)}}else{let W=P.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=s.createRenderbuffer(),Oe(S.__webglDepthbuffer,P,!1);else{let J=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,de=S.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,de),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,de)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function le(P,S,z){let W=i.get(P);S!==void 0&&xe(W.__webglFramebuffer,P,P.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),z!==void 0&&te(P)}function ce(P){let S=P.texture,z=i.get(P),W=i.get(S);P.addEventListener("dispose",x);let J=P.textures,de=P.isWebGLCubeRenderTarget===!0,pe=J.length>1;if(pe||(W.__webglTexture===void 0&&(W.__webglTexture=s.createTexture()),W.__version=S.version,a.memory.textures++),de){z.__webglFramebuffer=[];for(let j=0;j<6;j++)if(S.mipmaps&&S.mipmaps.length>0){z.__webglFramebuffer[j]=[];for(let re=0;re<S.mipmaps.length;re++)z.__webglFramebuffer[j][re]=s.createFramebuffer()}else z.__webglFramebuffer[j]=s.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){z.__webglFramebuffer=[];for(let j=0;j<S.mipmaps.length;j++)z.__webglFramebuffer[j]=s.createFramebuffer()}else z.__webglFramebuffer=s.createFramebuffer();if(pe)for(let j=0,re=J.length;j<re;j++){let ve=i.get(J[j]);ve.__webglTexture===void 0&&(ve.__webglTexture=s.createTexture(),a.memory.textures++)}if(P.samples>0&&je(P)===!1){z.__webglMultisampledFramebuffer=s.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let j=0;j<J.length;j++){let re=J[j];z.__webglColorRenderbuffer[j]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,z.__webglColorRenderbuffer[j]);let ve=r.convert(re.format,re.colorSpace),Be=r.convert(re.type),we=v(re.internalFormat,ve,Be,re.normalized,re.colorSpace,P.isXRRenderTarget===!0),ye=Ke(P);s.renderbufferStorageMultisample(s.RENDERBUFFER,ye,we,P.width,P.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+j,s.RENDERBUFFER,z.__webglColorRenderbuffer[j])}s.bindRenderbuffer(s.RENDERBUFFER,null),P.depthBuffer&&(z.__webglDepthRenderbuffer=s.createRenderbuffer(),Oe(z.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(de){t.bindTexture(s.TEXTURE_CUBE_MAP,W.__webglTexture),He(s.TEXTURE_CUBE_MAP,S);for(let j=0;j<6;j++)if(S.mipmaps&&S.mipmaps.length>0)for(let re=0;re<S.mipmaps.length;re++)xe(z.__webglFramebuffer[j][re],P,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+j,re);else xe(z.__webglFramebuffer[j],P,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0);m(S)&&y(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(pe){for(let j=0,re=J.length;j<re;j++){let ve=J[j],Be=i.get(ve),we=s.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(we=P.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(we,Be.__webglTexture),He(we,ve),xe(z.__webglFramebuffer,P,ve,s.COLOR_ATTACHMENT0+j,we,0),m(ve)&&y(we)}t.unbindTexture()}else{let j=s.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(j=P.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(j,W.__webglTexture),He(j,S),S.mipmaps&&S.mipmaps.length>0)for(let re=0;re<S.mipmaps.length;re++)xe(z.__webglFramebuffer[re],P,S,s.COLOR_ATTACHMENT0,j,re);else xe(z.__webglFramebuffer,P,S,s.COLOR_ATTACHMENT0,j,0);m(S)&&y(j),t.unbindTexture()}P.depthBuffer&&te(P)}function he(P){let S=P.textures;for(let z=0,W=S.length;z<W;z++){let J=S[z];if(m(J)){let de=w(P),pe=i.get(J).__webglTexture;t.bindTexture(de,pe),y(de),t.unbindTexture()}}}let ge=[],We=[];function Ge(P){if(P.samples>0){if(je(P)===!1){let S=P.textures,z=P.width,W=P.height,J=s.COLOR_BUFFER_BIT,de=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,pe=i.get(P),j=S.length>1;if(j)for(let ve=0;ve<S.length;ve++)t.bindFramebuffer(s.FRAMEBUFFER,pe.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ve,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,pe.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ve,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,pe.__webglMultisampledFramebuffer);let re=P.texture.mipmaps;re&&re.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,pe.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,pe.__webglFramebuffer);for(let ve=0;ve<S.length;ve++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(J|=s.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(J|=s.STENCIL_BUFFER_BIT)),j){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,pe.__webglColorRenderbuffer[ve]);let Be=i.get(S[ve]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Be,0)}s.blitFramebuffer(0,0,z,W,0,0,z,W,J,s.NEAREST),l===!0&&(ge.length=0,We.length=0,ge.push(s.COLOR_ATTACHMENT0+ve),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&(ge.push(de),We.push(de),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,We)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,ge))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),j)for(let ve=0;ve<S.length;ve++){t.bindFramebuffer(s.FRAMEBUFFER,pe.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ve,s.RENDERBUFFER,pe.__webglColorRenderbuffer[ve]);let Be=i.get(S[ve]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,pe.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ve,s.TEXTURE_2D,Be,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,pe.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&l){let S=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[S])}}}function Ke(P){return Math.min(n.maxSamples,P.samples)}function je(P){let S=i.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function L(P){let S=a.render.frame;h.get(P)!==S&&(h.set(P,S),P.update())}function pt(P,S){let z=P.colorSpace,W=P.format,J=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||z!==Vr&&z!==Mn&&(nt.getTransfer(z)===ut?(W!==ri||J!==gi)&&_e("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ue("WebGLTextures: Unsupported texture color space:",z)),S}function ot(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=X,this.resetTextureUnits=O,this.getTextureUnits=D,this.setTextureUnits=B,this.setTexture2D=ne,this.setTexture2DArray=q,this.setTexture3D=ee,this.setTextureCube=$,this.rebindTextures=le,this.setupRenderTarget=ce,this.updateRenderTargetMipmap=he,this.updateMultisampleRenderTarget=Ge,this.setupDepthRenderbuffer=te,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=je,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function E0(s,e){function t(i,n=Mn){let r,a=nt.getTransfer(n);if(i===gi)return s.UNSIGNED_BYTE;if(i===bl)return s.UNSIGNED_SHORT_4_4_4_4;if(i===Sl)return s.UNSIGNED_SHORT_5_5_5_1;if(i===Su)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===wu)return s.UNSIGNED_INT_10F_11F_11F_REV;if(i===Mu)return s.BYTE;if(i===bu)return s.SHORT;if(i===rr)return s.UNSIGNED_SHORT;if(i===Ml)return s.INT;if(i===Ii)return s.UNSIGNED_INT;if(i===si)return s.FLOAT;if(i===Jt)return s.HALF_FLOAT;if(i===Tu)return s.ALPHA;if(i===Eu)return s.RGB;if(i===ri)return s.RGBA;if(i===tn)return s.DEPTH_COMPONENT;if(i===Vn)return s.DEPTH_STENCIL;if(i===wl)return s.RED;if(i===Aa)return s.RED_INTEGER;if(i===Gn)return s.RG;if(i===Tl)return s.RG_INTEGER;if(i===El)return s.RGBA_INTEGER;if(i===Ca||i===Ra||i===Pa||i===Ia)if(a===ut)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Ca)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ra)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Pa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Ia)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Ca)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ra)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Pa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Ia)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Al||i===Cl||i===Rl||i===Pl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Al)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Cl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Rl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Pl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Il||i===Dl||i===Ll||i===Nl||i===Ul||i===Da||i===Fl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Il||i===Dl)return a===ut?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Ll)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Nl)return r.COMPRESSED_R11_EAC;if(i===Ul)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Da)return r.COMPRESSED_RG11_EAC;if(i===Fl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Ol||i===Bl||i===zl||i===kl||i===Vl||i===Gl||i===Hl||i===Wl||i===Xl||i===ql||i===Yl||i===Zl||i===Kl||i===Jl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Ol)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Bl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===zl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===kl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Vl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Gl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Hl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Wl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Xl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ql)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Yl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Zl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Kl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Jl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===$l||i===jl||i===Ql)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===$l)return a===ut?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===jl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ql)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===ec||i===tc||i===La||i===ic)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===ec)return r.COMPRESSED_RED_RGTC1_EXT;if(i===tc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===La)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ic)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ar?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:t}}var JS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$S=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,rp=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new Jr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Rt({vertexShader:JS,fragmentShader:$S,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new st(new Ri(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ap=class extends ai{constructor(e,t){super();let i=this,n=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,p=null,_=typeof XRWebGLBinding<"u",g=new rp,m={},y=t.getContextAttributes(),w=null,v=null,b=[],M=[],A=new Z,x=null,T=null,R=new kt;R.viewport=new xt;let I=new kt;I.viewport=new xt;let U=[R,I],O=new ml,D=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let se=b[K];return se===void 0&&(se=new Os,b[K]=se),se.getTargetRaySpace()},this.getControllerGrip=function(K){let se=b[K];return se===void 0&&(se=new Os,b[K]=se),se.getGripSpace()},this.getHand=function(K){let se=b[K];return se===void 0&&(se=new Os,b[K]=se),se.getHandSpace()};function X(K){let se=M.indexOf(K.inputSource);if(se===-1)return;let me=b[se];me!==void 0&&(me.update(K.inputSource,K.frame,c||a),me.dispatchEvent({type:K.type,data:K.inputSource}))}function k(){n.removeEventListener("select",X),n.removeEventListener("selectstart",X),n.removeEventListener("selectend",X),n.removeEventListener("squeeze",X),n.removeEventListener("squeezestart",X),n.removeEventListener("squeezeend",X),n.removeEventListener("end",k),n.removeEventListener("inputsourceschange",ne);for(let K=0;K<b.length;K++){let se=M[K];se!==null&&(M[K]=null,b[K].disconnect(se))}D=null,B=null,g.reset();for(let K in m)delete m[K];if(e.setRenderTarget(w),f=null,u=null,d=null,n=null,v=null,rt.stop(),i.isPresenting=!1,e.setPixelRatio(x),e.setSize(A.width,A.height,!1),T!==null){let K=T.camera;K.fov=T.fov,K.zoom=T.zoom,K.updateProjectionMatrix(),T=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&_e("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,i.isPresenting===!0&&_e("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(n,t)),d},this.getFrame=function(){return p},this.getSession=function(){return n},this.setSession=async function(K){if(n=K,n!==null){if(w=e.getRenderTarget(),n.addEventListener("select",X),n.addEventListener("selectstart",X),n.addEventListener("selectend",X),n.addEventListener("squeeze",X),n.addEventListener("squeezestart",X),n.addEventListener("squeezeend",X),n.addEventListener("end",k),n.addEventListener("inputsourceschange",ne),y.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(A),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let me=null,Ve=null,xe=null;y.depth&&(xe=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,me=y.stencil?Vn:tn,Ve=y.stencil?ar:Ii);let Oe={colorFormat:t.RGBA8,depthFormat:xe,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Oe),n.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),v=new Ct(u.textureWidth,u.textureHeight,{format:ri,type:gi,depthTexture:new Un(u.textureWidth,u.textureHeight,Ve,void 0,void 0,void 0,void 0,void 0,void 0,me),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let me={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(n,t,me),n.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new Ct(f.framebufferWidth,f.framebufferHeight,{format:ri,type:gi,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await n.requestReferenceSpace(o),rt.setContext(n),rt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function ne(K){for(let se=0;se<K.removed.length;se++){let me=K.removed[se],Ve=M.indexOf(me);Ve>=0&&(M[Ve]=null,b[Ve].disconnect(me))}for(let se=0;se<K.added.length;se++){let me=K.added[se],Ve=M.indexOf(me);if(Ve===-1){for(let Oe=0;Oe<b.length;Oe++)if(Oe>=M.length){M.push(me),Ve=Oe;break}else if(M[Oe]===null){M[Oe]=me,Ve=Oe;break}if(Ve===-1)break}let xe=b[Ve];xe&&xe.connect(me)}}let q=new C,ee=new C;function $(K,se,me){q.setFromMatrixPosition(se.matrixWorld),ee.setFromMatrixPosition(me.matrixWorld);let Ve=q.distanceTo(ee),xe=se.projectionMatrix.elements,Oe=me.projectionMatrix.elements,at=xe[14]/(xe[10]-1),te=xe[14]/(xe[10]+1),le=(xe[9]+1)/xe[5],ce=(xe[9]-1)/xe[5],he=(xe[8]-1)/xe[0],ge=(Oe[8]+1)/Oe[0],We=at*he,Ge=at*ge,Ke=Ve/(-he+ge),je=Ke*-he;if(se.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(je),K.translateZ(Ke),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),xe[10]===-1)K.projectionMatrix.copy(se.projectionMatrix),K.projectionMatrixInverse.copy(se.projectionMatrixInverse);else{let L=at+Ke,pt=te+Ke,ot=We-je,P=Ge+(Ve-je),S=le*te/pt*L,z=ce*te/pt*L;K.projectionMatrix.makePerspective(ot,P,S,z,L,pt),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function H(K,se){se===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(se.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(n===null)return;let se=K.near,me=K.far;g.texture!==null&&(g.depthNear>0&&(se=g.depthNear),g.depthFar>0&&(me=g.depthFar)),O.near=I.near=R.near=se,O.far=I.far=R.far=me,(D!==O.near||B!==O.far)&&(n.updateRenderState({depthNear:O.near,depthFar:O.far}),D=O.near,B=O.far),O.layers.mask=K.layers.mask|6,R.layers.mask=O.layers.mask&-5,I.layers.mask=O.layers.mask&-3;let Ve=K.parent,xe=O.cameras;H(O,Ve);for(let Oe=0;Oe<xe.length;Oe++)H(xe[Oe],Ve);xe.length===2?$(O,R,I):O.projectionMatrix.copy(R.projectionMatrix),T===null&&K.isPerspectiveCamera&&(T={camera:K,fov:K.fov,zoom:K.zoom}),Q(K,O,Ve)};function Q(K,se,me){me===null?K.matrix.copy(se.matrixWorld):(K.matrix.copy(me.matrixWorld),K.matrix.invert(),K.matrix.multiply(se.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(se.projectionMatrix),K.projectionMatrixInverse.copy(se.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=Ls*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(K){l=K,u!==null&&(u.fixedFoveation=K),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=K)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(O)},this.getCameraTexture=function(K){return m[K]};let Ie=null;function He(K,se){if(h=se.getViewerPose(c||a),p=se,h!==null){let me=h.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let Ve=!1;me.length!==O.cameras.length&&(O.cameras.length=0,Ve=!0);for(let te=0;te<me.length;te++){let le=me[te],ce=null;if(f!==null)ce=f.getViewport(le);else{let ge=d.getViewSubImage(u,le);ce=ge.viewport,te===0&&(e.setRenderTargetTextures(v,ge.colorTexture,ge.depthStencilTexture),e.setRenderTarget(v))}let he=U[te];he===void 0&&(he=new kt,he.layers.enable(te),he.viewport=new xt,U[te]=he),he.matrix.fromArray(le.transform.matrix),he.matrix.decompose(he.position,he.quaternion,he.scale),he.projectionMatrix.fromArray(le.projectionMatrix),he.projectionMatrixInverse.copy(he.projectionMatrix).invert(),he.viewport.set(ce.x,ce.y,ce.width,ce.height),te===0&&(O.matrix.copy(he.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),Ve===!0&&O.cameras.push(he)}let xe=n.enabledFeatures;if(xe&&xe.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&_){d=i.getBinding();let te=d.getDepthInformation(me[0]);te&&te.isValid&&te.texture&&g.init(te,n.renderState)}if(xe&&xe.includes("camera-access")&&_){e.state.unbindTexture(),d=i.getBinding();for(let te=0;te<me.length;te++){let le=me[te].camera;if(le){let ce=m[le];ce||(ce=new Jr,m[le]=ce);let he=d.getCameraImage(le);ce.sourceTexture=he}}}}for(let me=0;me<b.length;me++){let Ve=M[me],xe=b[me];Ve!==null&&xe!==void 0&&xe.update(Ve,se,c||a)}Ie&&Ie(K,se),se.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:se}),p=null}let rt=new y0;rt.setAnimationLoop(He),this.setAnimationLoop=function(K){Ie=K},this.dispose=function(){}}},jS=new qe,A0=new Je;A0.set(-1,0,0,0,1,0,0,0,1);function QS(s,e){function t(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function i(g,m){m.color.getRGB(g.fogColor.value,Gf(s)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function n(g,m,y,w,v){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(g,m):m.isMeshLambertMaterial?(r(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(g,m),d(g,m)):m.isMeshPhongMaterial?(r(g,m),h(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(g,m),u(g,m),m.isMeshPhysicalMaterial&&f(g,m,v)):m.isMeshMatcapMaterial?(r(g,m),p(g,m)):m.isMeshDepthMaterial?r(g,m):m.isMeshDistanceMaterial?(r(g,m),_(g,m)):m.isMeshNormalMaterial?r(g,m):m.isLineBasicMaterial?(a(g,m),m.isLineDashedMaterial&&o(g,m)):m.isPointsMaterial?l(g,m,y,w):m.isSpriteMaterial?c(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,t(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===oi&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,t(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===oi&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,t(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,t(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);let y=e.get(m),w=y.envMap,v=y.envMapRotation;w&&(g.envMap.value=w,g.envMapRotation.value.setFromMatrix4(jS.makeRotationFromEuler(v)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(A0),g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,g.aoMapTransform))}function a(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform))}function o(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function l(g,m,y,w){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*y,g.scale.value=w*.5,m.map&&(g.map.value=m.map,t(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function c(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function h(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function d(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function u(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function f(g,m,y){g.ior.value=m.ior,m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===oi&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.retroreflectivity>0&&(g.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=y.texture,g.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,g.specularIntensityMapTransform))}function p(g,m){m.matcap&&(g.matcap.value=m.matcap)}function _(g,m){let y=e.get(m).light;g.referencePosition.value.setFromMatrixPosition(y.matrixWorld),g.nearDistance.value=y.shadow.camera.near,g.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function ew(s,e,t,i){let n={},r={},a=[],o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,b){let M=b.program;i.uniformBlockBinding(v,M)}function c(v,b){let M=n[v.id];M===void 0&&(g(v),M=h(v),n[v.id]=M,v.addEventListener("dispose",y));let A=b.program;i.updateUBOMapping(v,A);let x=e.render.frame;r[v.id]!==x&&(u(v),r[v.id]=x)}function h(v){let b=d();v.__bindingPointIndex=b;let M=s.createBuffer(),A=v.__size,x=v.usage;return s.bindBuffer(s.UNIFORM_BUFFER,M),s.bufferData(s.UNIFORM_BUFFER,A,x),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,b,M),M}function d(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return Ue("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(v){let b=n[v.id],M=v.uniforms,A=v.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let x=0,T=M.length;x<T;x++){let R=M[x];if(Array.isArray(R))for(let I=0,U=R.length;I<U;I++)f(R[I],x,I,A);else f(R,x,0,A)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(v,b,M,A){if(_(v,b,M,A)===!0){let x=v.__offset,T=v.value;if(Array.isArray(T)){let R=0;for(let I=0;I<T.length;I++){let U=T[I],O=m(U);p(U,v.__data,R),typeof U!="number"&&typeof U!="boolean"&&!U.isMatrix3&&!ArrayBuffer.isView(U)&&(R+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(T,v.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,x,v.__data)}}function p(v,b,M){typeof v=="number"||typeof v=="boolean"?b[0]=v:v.isMatrix3?(b[0]=v.elements[0],b[1]=v.elements[1],b[2]=v.elements[2],b[3]=0,b[4]=v.elements[3],b[5]=v.elements[4],b[6]=v.elements[5],b[7]=0,b[8]=v.elements[6],b[9]=v.elements[7],b[10]=v.elements[8],b[11]=0):ArrayBuffer.isView(v)?b.set(new v.constructor(v.buffer,v.byteOffset,b.length)):v.toArray(b,M)}function _(v,b,M,A){let x=v.value,T=b+"_"+M;if(A[T]===void 0)return typeof x=="number"||typeof x=="boolean"?A[T]=x:ArrayBuffer.isView(x)?A[T]=x.slice():A[T]=x.clone(),!0;{let R=A[T];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return A[T]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function g(v){let b=v.uniforms,M=0,A=16;for(let T=0,R=b.length;T<R;T++){let I=Array.isArray(b[T])?b[T]:[b[T]];for(let U=0,O=I.length;U<O;U++){let D=I[U],B=Array.isArray(D.value)?D.value:[D.value];for(let X=0,k=B.length;X<k;X++){let ne=B[X],q=m(ne),ee=M%A,$=ee%q.boundary,H=ee+$;M+=$,H!==0&&A-H<q.storage&&(M+=A-H),D.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=M,M+=q.storage}}}let x=M%A;return x>0&&(M+=A-x),v.__size=M,v.__cache={},this}function m(v){let b={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(b.boundary=4,b.storage=4):v.isVector2?(b.boundary=8,b.storage=8):v.isVector3||v.isColor?(b.boundary=16,b.storage=12):v.isVector4?(b.boundary=16,b.storage=16):v.isMatrix3?(b.boundary=48,b.storage=48):v.isMatrix4?(b.boundary=64,b.storage=64):v.isTexture?_e("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(b.boundary=16,b.storage=v.byteLength):_e("WebGLRenderer: Unsupported uniform value type.",v),b}function y(v){let b=v.target;b.removeEventListener("dispose",y);let M=a.indexOf(b.__bindingPointIndex);a.splice(M,1),s.deleteBuffer(n[b.id]),delete n[b.id],delete r[b.id]}function w(){for(let v in n)s.deleteBuffer(n[v]);a=[],n={},r={}}return{bind:l,update:c,dispose:w}}var tw=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Sn=null;function iw(){return Sn===null&&(Sn=new fi(tw,16,16,Gn,Jt),Sn.name="DFG_LUT",Sn.minFilter=Tt,Sn.magFilter=Tt,Sn.wrapS=di,Sn.wrapT=di,Sn.generateMipmaps=!1,Sn.needsUpdate=!0),Sn}var dc=class{constructor(e={}){let{canvas:t=zf(),context:i=null,depth:n=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=gi}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=a;let _=f,g=new Set([El,Tl,Aa]),m=new Set([gi,Ii,rr,ar,bl,Sl]),y=new Uint32Array(4),w=new Int32Array(4),v=new C,b=null,M=null,A=[],x=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Xi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,U=null,O=null,D=null,B=null;this._outputColorSpace=zt;let X=0,k=0,ne=null,q=-1,ee=null,$=new xt,H=new xt,Q=null,Ie=new ae(0),He=0,rt=t.width,K=t.height,se=1,me=null,Ve=null,xe=new xt(0,0,rt,K),Oe=new xt(0,0,rt,K),at=!1,te=new pn,le=!1,ce=!1,he=new qe,ge=new C,We=new xt,Ge={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ke=!1;function je(){return ne===null?se:1}let L=i;function pt(E,N){return t.getContext(E,N)}let ot,P,S,z,W,J,de,pe,j,re,ve,Be,we,ye,ze,Xe,Qe,F,Me,ie,be,Ce,oe;try{let E={alpha:!0,depth:n,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",St,!1),t.addEventListener("webglcontextrestored",mt,!1),t.addEventListener("webglcontextcreationerror",Zi,!1),L===null){let N="webgl2";if(L=pt(N,E),L===null)throw pt(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}ke()}catch(E){throw t.removeEventListener("webglcontextlost",St,!1),t.removeEventListener("webglcontextrestored",mt,!1),t.removeEventListener("webglcontextcreationerror",Zi,!1),Ue("WebGLRenderer: "+E.message),E}function ke(){ot=new hb(L),ot.init(),be=new E0(L,ot),P=new eb(L,ot,e,be),S=new ZS(L,ot),P.reversedDepthBuffer&&u&&S.buffers.depth.setReversed(!0),O=L.createFramebuffer(),D=L.createFramebuffer(),B=L.createFramebuffer(),z=new fb(L),W=new NS,J=new KS(L,ot,S,W,P,be,z),de=new cb(R),pe=new mv(L),Ce=new jM(L,pe),j=new ub(L,pe,z,Ce),re=new mb(L,j,pe,Ce,z),F=new pb(L,P,J),ze=new tb(W),ve=new LS(R,de,ot,P,Ce,ze),Be=new QS(R,W),we=new FS,ye=new GS(ot),Qe=new $M(R,de,S,re,p,l),Xe=new YS(R,re,P),oe=new ew(L,z,P,S),Me=new QM(L,ot,z),ie=new db(L,ot,z),z.programs=ve.programs,R.capabilities=P,R.extensions=ot,R.properties=W,R.renderLists=we,R.shadowMap=Xe,R.state=S,R.info=z}_!==gi&&(T=new _b(_,t.width,t.height,o,n,r));let Ne=new ap(R,L);this.xr=Ne,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let E=ot.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=ot.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return se},this.setPixelRatio=function(E){E!==void 0&&(se=E,this.setSize(rt,K,!1))},this.getSize=function(E){return E.set(rt,K)},this.setSize=function(E,N,Y=!0){if(Ne.isPresenting){_e("WebGLRenderer: Can't change size while VR device is presenting.");return}rt=E,K=N,t.width=Math.floor(E*se),t.height=Math.floor(N*se),Y===!0&&(t.style.width=E+"px",t.style.height=N+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,E,N)},this.getDrawingBufferSize=function(E){return E.set(rt*se,K*se).floor()},this.setDrawingBufferSize=function(E,N,Y){rt=E,K=N,se=Y,t.width=Math.floor(E*Y),t.height=Math.floor(N*Y),this.setViewport(0,0,E,N)},this.setEffects=function(E){if(_===gi){Ue("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let N=0;N<E.length;N++)if(E[N].isOutputPass===!0){_e("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy($)},this.getViewport=function(E){return E.copy(xe)},this.setViewport=function(E,N,Y,V){E.isVector4?xe.set(E.x,E.y,E.z,E.w):xe.set(E,N,Y,V),S.viewport($.copy(xe).multiplyScalar(se).round())},this.getScissor=function(E){return E.copy(Oe)},this.setScissor=function(E,N,Y,V){E.isVector4?Oe.set(E.x,E.y,E.z,E.w):Oe.set(E,N,Y,V),S.scissor(H.copy(Oe).multiplyScalar(se).round())},this.getScissorTest=function(){return at},this.setScissorTest=function(E){S.setScissorTest(at=E)},this.setOpaqueSort=function(E){me=E},this.setTransparentSort=function(E){Ve=E},this.getClearColor=function(E){return E.copy(Qe.getClearColor())},this.setClearColor=function(){Qe.setClearColor(...arguments)},this.getClearAlpha=function(){return Qe.getClearAlpha()},this.setClearAlpha=function(){Qe.setClearAlpha(...arguments)},this.clear=function(E=!0,N=!0,Y=!0){let V=0;if(E){let G=!1;if(ne!==null){let Ae=ne.texture.format;G=g.has(Ae)}if(G){let Ae=ne.texture.type,Pe=m.has(Ae),Ee=Qe.getClearColor(),De=Qe.getClearAlpha(),Fe=Ee.r,it=Ee.g,lt=Ee.b;Pe?(y[0]=Fe,y[1]=it,y[2]=lt,y[3]=De,L.clearBufferuiv(L.COLOR,0,y)):(w[0]=Fe,w[1]=it,w[2]=lt,w[3]=De,L.clearBufferiv(L.COLOR,0,w))}else V|=L.COLOR_BUFFER_BIT}N&&(V|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(V|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&L.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),U=E},this.dispose=function(){t.removeEventListener("webglcontextlost",St,!1),t.removeEventListener("webglcontextrestored",mt,!1),t.removeEventListener("webglcontextcreationerror",Zi,!1),Qe.dispose(),we.dispose(),ye.dispose(),W.dispose(),de.dispose(),re.dispose(),Ce.dispose(),oe.dispose(),ve.dispose(),Ne.dispose(),Ne.removeEventListener("sessionstart",Ep),Ne.removeEventListener("sessionend",Ap),xs.stop()};function St(E){E.preventDefault(),Wr("WebGLRenderer: Context Lost."),I=!0}function mt(){Wr("WebGLRenderer: Context Restored."),I=!1;let E=z.autoReset,N=Xe.enabled,Y=Xe.autoUpdate,V=Xe.needsUpdate,G=Xe.type;ke(),z.autoReset=E,Xe.enabled=N,Xe.autoUpdate=Y,Xe.needsUpdate=V,Xe.type=G}function Zi(E){Ue("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function hn(E){let N=E.target;N.removeEventListener("dispose",hn),c_(N)}function c_(E){h_(E),W.remove(E)}function h_(E){let N=W.get(E).programs;N!==void 0&&(N.forEach(function(Y){ve.releaseProgram(Y)}),E.isShaderMaterial&&ve.releaseShaderCache(E))}this.renderBufferDirect=function(E,N,Y,V,G,Ae){N===null&&(N=Ge);let Pe=G.isMesh&&G.matrixWorld.determinantAffine()<0,Ee=f_(E,N,Y,V,G);S.setMaterial(V,Pe);let De=Y.index,Fe=1;if(V.wireframe===!0){if(De=j.getWireframeAttribute(Y),De===void 0)return;Fe=2}let it=Y.drawRange,lt=Y.attributes.position,Le=it.start*Fe,gt=(it.start+it.count)*Fe;Ae!==null&&(Le=Math.max(Le,Ae.start*Fe),gt=Math.min(gt,(Ae.start+Ae.count)*Fe)),De!==null?(Le=Math.max(Le,0),gt=Math.min(gt,De.count)):lt!=null&&(Le=Math.max(Le,0),gt=Math.min(gt,lt.count));let Ot=gt-Le;if(Ot<0||Ot===1/0)return;Ce.setup(G,V,Ee,Y,De);let Et,Mt=Me;if(De!==null&&(Et=pe.get(De),Mt=ie,Mt.setIndex(Et)),G.isMesh)V.wireframe===!0?(S.setLineWidth(V.wireframeLinewidth*je()),Mt.setMode(L.LINES)):Mt.setMode(L.TRIANGLES);else if(G.isLine){let ei=V.linewidth;ei===void 0&&(ei=1),S.setLineWidth(ei*je()),G.isLineSegments?Mt.setMode(L.LINES):G.isLineLoop?Mt.setMode(L.LINE_LOOP):Mt.setMode(L.LINE_STRIP)}else G.isPoints?Mt.setMode(L.POINTS):G.isSprite&&Mt.setMode(L.TRIANGLES);if(G.isBatchedMesh)if(ot.get("WEBGL_multi_draw"))Mt.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let ei=G._multiDrawStarts,Re=G._multiDrawCounts,ci=G._multiDrawCount,ht=De?pe.get(De).bytesPerElement:1,Li=W.get(V).currentProgram.getUniforms();for(let un=0;un<ci;un++)Li.setValue(L,"_gl_DrawID",un),Mt.render(ei[un]/ht,Re[un])}else if(G.isInstancedMesh)Mt.renderInstances(Le,Ot,G.count);else if(Y.isInstancedBufferGeometry){let ei=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Re=Math.min(Y.instanceCount,ei);Mt.renderInstances(Le,Ot,Re)}else Mt.render(Le,Ot)};function Tp(E,N,Y,V){U!==null&&E.isNodeMaterial&&U.setObject(V,E),le===!0&&ze.setState(E,Y,!1),E.transparent===!0&&E.side===mi&&E.forceSinglePass===!1?(E.side=oi,E.needsUpdate=!0,yc(E,N,V),E.side=Bn,E.needsUpdate=!0,yc(E,N,V),E.side=mi):yc(E,N,V)}this.compile=function(E,N,Y=null){Y===null&&(Y=E),U!==null&&U.renderStart(E,N,Y),M=ye.get(Y),M.init(N),x.push(M),Y.traverseVisible(function(G){G.isLight&&G.layers.test(N.layers)&&(M.pushLight(G),G.castShadow&&M.pushShadow(G))}),E!==Y&&E.traverseVisible(function(G){G.isLight&&G.layers.test(N.layers)&&(M.pushLight(G),G.castShadow&&M.pushShadow(G))}),M.setupLights(),U!==null&&U.updateLights(M.state.lightsArray),ce=this.localClippingEnabled,le=ze.init(this.clippingPlanes,ce),le===!0&&ze.setGlobalState(this.clippingPlanes,N),U!==null&&Xe.render(M.state.shadowsArray,Y,N);let V=new Set;return E.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let Ae=G.material;if(Ae)if(Array.isArray(Ae))for(let Pe=0;Pe<Ae.length;Pe++){let Ee=Ae[Pe];Tp(Ee,Y,N,G),V.add(Ee)}else Tp(Ae,Y,N,G),V.add(Ae)}),M=x.pop(),U!==null&&U.renderEnd(),V},this.compileAsync=function(E,N,Y=null){let V=this.compile(E,N,Y);return new Promise(G=>{function Ae(){if(V.forEach(function(Pe){let De=W.get(Pe).currentProgram;(De===void 0||De.isReady())&&V.delete(Pe)}),V.size===0){G(E);return}setTimeout(Ae,10)}ot.get("KHR_parallel_shader_compile")!==null?Ae():setTimeout(Ae,10)})};let sd=null;function u_(E){sd&&sd(E)}function Ep(){xs.stop()}function Ap(){xs.start()}let xs=new y0;xs.setAnimationLoop(u_),typeof self<"u"&&xs.setContext(self),this.setAnimationLoop=function(E){sd=E,Ne.setAnimationLoop(E),E===null?xs.stop():xs.start()},Ne.addEventListener("sessionstart",Ep),Ne.addEventListener("sessionend",Ap),this.render=function(E,N){if(N!==void 0&&N.isCamera!==!0){Ue("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;U!==null&&U.renderStart(E,N);let Y=Ne.enabled===!0&&Ne.isPresenting===!0,V=T!==null&&(ne===null||Y)&&T.begin(R,ne);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Ne.enabled===!0&&Ne.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(Ne.cameraAutoUpdate===!0&&Ne.updateCamera(N),N=Ne.getCamera()),E.isScene===!0&&E.onBeforeRender(R,E,N,ne),M=ye.get(E,x.length),M.init(N),M.state.textureUnits=J.getTextureUnits(),x.push(M),he.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),te.setFromProjectionMatrix(he,yi,N.reversedDepth),ce=this.localClippingEnabled,le=ze.init(this.clippingPlanes,ce),b=we.get(E,A.length),b.init(),A.push(b),Ne.enabled===!0&&Ne.isPresenting===!0){let Pe=R.xr.getDepthSensingMesh();Pe!==null&&rd(Pe,N,-1/0,R.sortObjects)}rd(E,N,0,R.sortObjects),b.finish(),U!==null&&U.updateLights(M.state.lightsArray),R.sortObjects===!0&&b.sort(me,Ve),Ke=Ne.enabled===!1||Ne.isPresenting===!1||Ne.hasDepthSensing()===!1,Ke&&Qe.addToRenderList(b,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),le===!0&&ze.beginShadows();let G=M.state.shadowsArray;if(Xe.render(G,E,N),le===!0&&ze.endShadows(),(V&&T.hasRenderPass())===!1){let Pe=b.opaque,Ee=b.transmissive;if(M.setupLights(),N.isArrayCamera){let De=N.cameras;if(Ee.length>0)for(let Fe=0,it=De.length;Fe<it;Fe++){let lt=De[Fe];Rp(Pe,Ee,E,lt)}Ke&&Qe.render(E);for(let Fe=0,it=De.length;Fe<it;Fe++){let lt=De[Fe];Cp(b,E,lt,lt.viewport)}}else Ee.length>0&&Rp(Pe,Ee,E,N),Ke&&Qe.render(E),Cp(b,E,N)}ne!==null&&k===0&&(J.updateMultisampleRenderTarget(ne),J.updateRenderTargetMipmap(ne)),V&&T.end(R),E.isScene===!0&&E.onAfterRender(R,E,N),Ce.resetDefaultState(),q=-1,ee=null,x.pop(),x.length>0?(M=x[x.length-1],J.setTextureUnits(M.state.textureUnits),le===!0&&ze.setGlobalState(R.clippingPlanes,M.state.camera)):M=null,A.pop(),A.length>0?b=A[A.length-1]:b=null,U!==null&&U.renderEnd()};function rd(E,N,Y,V){if(E.visible===!1)return;if(E.layers.test(N.layers)){if(E.isGroup)Y=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(N);else if(E.isLightProbeGrid)M.pushLightProbeGrid(E);else if(E.isLight)M.pushLight(E),E.castShadow&&M.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||E.intersectsFrustum(te)){V&&We.setFromMatrixPosition(E.matrixWorld).applyMatrix4(he);let Pe=re.update(E),Ee=E.material;Ee.visible&&b.push(E,Pe,Ee,Y,We.z,null,N)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||E.intersectsFrustum(te))){let Pe=re.update(E),Ee=E.material;if(V&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),We.copy(E.boundingSphere.center)):(Pe.boundingSphere===null&&Pe.computeBoundingSphere(),We.copy(Pe.boundingSphere.center)),We.applyMatrix4(E.matrixWorld).applyMatrix4(he)),Array.isArray(Ee)){let De=Pe.groups;for(let Fe=0,it=De.length;Fe<it;Fe++){let lt=De[Fe],Le=Ee[lt.materialIndex];Le&&Le.visible&&b.push(E,Pe,Le,Y,We.z,lt,N)}}else Ee.visible&&b.push(E,Pe,Ee,Y,We.z,null,N)}}let Ae=E.children;for(let Pe=0,Ee=Ae.length;Pe<Ee;Pe++)rd(Ae[Pe],N,Y,V)}function Cp(E,N,Y,V){let{opaque:G,transmissive:Ae,transparent:Pe}=E;M.setupLightsView(Y),le===!0&&ze.setGlobalState(R.clippingPlanes,Y),V&&S.viewport($.copy(V)),G.length>0&&vc(G,N,Y),Ae.length>0&&vc(Ae,N,Y),Pe.length>0&&vc(Pe,N,Y),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function Rp(E,N,Y,V){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[V.id]===void 0){let Le=ot.has("EXT_color_buffer_half_float")||ot.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[V.id]=new Ct(1,1,{generateMipmaps:!0,type:Le?Jt:gi,minFilter:ln,samples:Math.max(4,P.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:nt.workingColorSpace})}let Ae=M.state.transmissionRenderTarget[V.id],Pe=V.viewport||$;Ae.setSize(Pe.z*R.transmissionResolutionScale,Pe.w*R.transmissionResolutionScale);let Ee=R.getRenderTarget(),De=R.getActiveCubeFace(),Fe=R.getActiveMipmapLevel();R.setRenderTarget(Ae),R.getClearColor(Ie),He=R.getClearAlpha(),He<1&&R.setClearColor(16777215,.5),R.clear(),Ke&&Qe.render(Y);let it=R.toneMapping;R.toneMapping=Xi;let lt=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),M.setupLightsView(V),le===!0&&ze.setGlobalState(R.clippingPlanes,V),vc(E,Y,V),J.updateMultisampleRenderTarget(Ae),J.updateRenderTargetMipmap(Ae),ot.has("WEBGL_multisampled_render_to_texture")===!1){let Le=!1;for(let gt=0,Ot=N.length;gt<Ot;gt++){let Et=N[gt],{object:Mt,geometry:ei,material:Re,group:ci}=Et;if(Re.side===mi&&Mt.layers.test(V.layers)){let ht=Re.side;Re.side=oi,Re.needsUpdate=!0,Pp(Mt,Y,V,ei,Re,ci),Re.side=ht,Re.needsUpdate=!0,Le=!0}}Le===!0&&(J.updateMultisampleRenderTarget(Ae),J.updateRenderTargetMipmap(Ae))}R.setRenderTarget(Ee,De,Fe),R.setClearColor(Ie,He),lt!==void 0&&(V.viewport=lt),R.toneMapping=it}function vc(E,N,Y){let V=N.isScene===!0?N.overrideMaterial:null;for(let G=0,Ae=E.length;G<Ae;G++){let Pe=E[G],{object:Ee,geometry:De,group:Fe}=Pe,it=Pe.material;it.allowOverride===!0&&V!==null&&(it=V),Ee.layers.test(Y.layers)&&Pp(Ee,N,Y,De,it,Fe)}}function Pp(E,N,Y,V,G,Ae){U!==null&&G.isNodeMaterial&&U.setObject(E,G),E.onBeforeRender(R,N,Y,V,G,Ae),E.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),G.onBeforeRender(R,N,Y,V,E,Ae),G.transparent===!0&&G.side===mi&&G.forceSinglePass===!1?(G.side=oi,G.needsUpdate=!0,R.renderBufferDirect(Y,N,V,G,E,Ae),G.side=Bn,G.needsUpdate=!0,R.renderBufferDirect(Y,N,V,G,E,Ae),G.side=mi):R.renderBufferDirect(Y,N,V,G,E,Ae),E.onAfterRender(R,N,Y,V,G,Ae)}function yc(E,N,Y){N.isScene!==!0&&(N=Ge);let V=W.get(E),G=M.state.lights,Ae=M.state.shadowsArray,Pe=G.state.version,Ee=ve.getParameters(E,G.state,Ae,N,Y,M.state.lightProbeGridArray),De=ve.getProgramCacheKey(Ee),Fe=V.programs;V.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?N.environment:null,V.fog=N.fog;let it=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;V.envMap=de.get(E.envMap||V.environment,it),V.envMapRotation=V.environment!==null&&E.envMap===null?N.environmentRotation:E.envMapRotation,Fe===void 0&&(E.addEventListener("dispose",hn),Fe=new Map,V.programs=Fe);let lt=Fe.get(De);if(lt!==void 0){if(V.currentProgram===lt&&V.lightsStateVersion===Pe)return Dp(E,Ee),lt}else Ee.uniforms=ve.getUniforms(E),U!==null&&E.isNodeMaterial&&U.build(E,Y,Ee),E.onBeforeCompile(Ee,R),lt=ve.acquireProgram(Ee,De),Fe.set(De,lt),V.uniforms=Ee.uniforms;let Le=V.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Le.clippingPlanes=ze.uniform),Dp(E,Ee),V.needsLights=m_(E),V.lightsStateVersion=Pe,V.needsLights&&(Le.ambientLightColor.value=G.state.ambient,Le.lightProbe.value=G.state.probe,Le.sunLights.value=G.state.sun,Le.sunLightShadows.value=G.state.sunShadow,Le.directionalLights.value=G.state.directional,Le.directionalLightShadows.value=G.state.directionalShadow,Le.spotLights.value=G.state.spot,Le.spotLightShadows.value=G.state.spotShadow,Le.rectAreaLights.value=G.state.rectArea,Le.ltc_1.value=G.state.rectAreaLTC1,Le.ltc_2.value=G.state.rectAreaLTC2,Le.pointLights.value=G.state.point,Le.pointLightShadows.value=G.state.pointShadow,Le.hemisphereLights.value=G.state.hemi,Le.sunShadowMatrix.value=G.state.sunShadowMatrix,Le.sunShadowCascade.value=G.state.sunShadowCascade,Le.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Le.spotLightMatrix.value=G.state.spotLightMatrix,Le.spotLightMap.value=G.state.spotLightMap,Le.pointShadowMatrix.value=G.state.pointShadowMatrix),V.lightProbeGrid=M.state.lightProbeGridArray.length>0,V.currentProgram=lt,V.uniformsList=null,lt}function Ip(E){if(E.uniformsList===null){let N=E.currentProgram.getUniforms();E.uniformsList=Oa.seqWithValue(N.seq,E.uniforms)}return E.uniformsList}function Dp(E,N){let Y=W.get(E);Y.outputColorSpace=N.outputColorSpace,Y.batching=N.batching,Y.batchingColor=N.batchingColor,Y.instancing=N.instancing,Y.instancingColor=N.instancingColor,Y.instancingMorph=N.instancingMorph,Y.skinning=N.skinning,Y.morphTargets=N.morphTargets,Y.morphNormals=N.morphNormals,Y.morphColors=N.morphColors,Y.morphTargetsCount=N.morphTargetsCount,Y.numClippingPlanes=N.numClippingPlanes,Y.numIntersection=N.numClipIntersection,Y.vertexAlphas=N.vertexAlphas,Y.vertexTangents=N.vertexTangents,Y.toneMapping=N.toneMapping}function d_(E,N){if(E.length===0)return null;if(E.length===1)return E[0].texture!==null?E[0]:null;v.setFromMatrixPosition(N.matrixWorld);for(let Y=0,V=E.length;Y<V;Y++){let G=E[Y];if(G.texture!==null&&G.boundingBox.containsPoint(v))return G}return null}function f_(E,N,Y,V,G){N.isScene!==!0&&(N=Ge),J.resetTextureUnits();let Ae=N.fog,Pe=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?N.environment:null,Ee=ne===null?R.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:nt.workingColorSpace,De=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,Fe=de.get(V.envMap||Pe,De),it=V.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,lt=!!Y.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Le=!!Y.morphAttributes.position,gt=!!Y.morphAttributes.normal,Ot=!!Y.morphAttributes.color,Et=Xi;V.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(Et=R.toneMapping);let Mt=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,ei=Mt!==void 0?Mt.length:0,Re=W.get(V),ci=M.state.lights;if(le===!0&&(ce===!0||E!==ee)){let wt=E===ee&&V.id===q;ze.setState(V,E,wt)}let ht=!1;V.version===Re.__version?(Re.needsLights&&Re.lightsStateVersion!==ci.state.version||Re.outputColorSpace!==Ee||G.isBatchedMesh&&Re.batching===!1||!G.isBatchedMesh&&Re.batching===!0||G.isBatchedMesh&&Re.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&Re.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&Re.instancing===!1||!G.isInstancedMesh&&Re.instancing===!0||G.isSkinnedMesh&&Re.skinning===!1||!G.isSkinnedMesh&&Re.skinning===!0||G.isInstancedMesh&&Re.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Re.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Re.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Re.instancingMorph===!1&&G.morphTexture!==null||Re.envMap!==Fe||V.fog===!0&&Re.fog!==Ae||Re.numClippingPlanes!==void 0&&(Re.numClippingPlanes!==ze.numPlanes||Re.numIntersection!==ze.numIntersection)||Re.vertexAlphas!==it||Re.vertexTangents!==lt||Re.morphTargets!==Le||Re.morphNormals!==gt||Re.morphColors!==Ot||Re.toneMapping!==Et||Re.morphTargetsCount!==ei||!!Re.lightProbeGrid!=M.state.lightProbeGridArray.length>0)&&(ht=!0):(ht=!0,Re.__version=V.version);let Li=Re.currentProgram;ht===!0&&(Li=yc(V,N,G),U&&V.isNodeMaterial&&U.onUpdateProgram(V,Li,Re));let un=!1,Hn=!1,dr=!1,yt=Li.getUniforms(),Ut=Re.uniforms;if(S.useProgram(Li.program)&&(un=!0,Hn=!0,dr=!0),V.id!==q&&(q=V.id,Hn=!0),Re.needsLights){let wt=d_(M.state.lightProbeGridArray,G);Re.lightProbeGrid!==wt&&(Re.lightProbeGrid=wt,Hn=!0)}if(un||ee!==E){S.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),yt.setValue(L,"projectionMatrix",E.projectionMatrix),yt.setValue(L,"viewMatrix",E.matrixWorldInverse);let Xn=yt.map.cameraPosition;Xn!==void 0&&Xn.setValue(L,ge.setFromMatrixPosition(E.matrixWorld)),P.logarithmicDepthBuffer&&yt.setValue(L,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&yt.setValue(L,"isOrthographic",E.isOrthographicCamera===!0),ee!==E&&(ee=E,Hn=!0,dr=!0)}if(Re.needsLights&&(ci.state.sunShadowMap.length>0&&yt.setValue(L,"sunShadowMap",ci.state.sunShadowMap,J),ci.state.directionalShadowMap.length>0&&yt.setValue(L,"directionalShadowMap",ci.state.directionalShadowMap,J),ci.state.spotShadowMap.length>0&&yt.setValue(L,"spotShadowMap",ci.state.spotShadowMap,J),ci.state.pointShadowMap.length>0&&yt.setValue(L,"pointShadowMap",ci.state.pointShadowMap,J)),G.isSkinnedMesh){yt.setOptional(L,G,"bindMatrix"),yt.setOptional(L,G,"bindMatrixInverse");let wt=G.skeleton;wt&&(wt.boneTexture===null&&wt.computeBoneTexture(),yt.setValue(L,"boneTexture",wt.boneTexture,J))}G.isBatchedMesh&&(yt.setOptional(L,G,"batchingTexture"),yt.setValue(L,"batchingTexture",G._matricesTexture,J),yt.setOptional(L,G,"batchingIdTexture"),yt.setValue(L,"batchingIdTexture",G._indirectTexture,J),yt.setOptional(L,G,"batchingColorTexture"),G._colorsTexture!==null&&yt.setValue(L,"batchingColorTexture",G._colorsTexture,J));let Wn=Y.morphAttributes;if((Wn.position!==void 0||Wn.normal!==void 0||Wn.color!==void 0)&&F.update(G,Y,Li),(Hn||Re.receiveShadow!==G.receiveShadow)&&(Re.receiveShadow=G.receiveShadow,yt.setValue(L,"receiveShadow",G.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&N.environment!==null&&(Ut.envMapIntensity.value=N.environmentIntensity),Ut.dfgLUT!==void 0&&(Ut.dfgLUT.value=iw()),Hn){if(yt.setValue(L,"toneMappingExposure",R.toneMappingExposure),Re.needsLights&&p_(Ut,dr),Ae&&V.fog===!0&&Be.refreshFogUniforms(Ut,Ae),Be.refreshMaterialUniforms(Ut,V,se,K,M.state.transmissionRenderTarget[E.id]),Re.needsLights&&Re.lightProbeGrid){let wt=Re.lightProbeGrid;Ut.probesSH.value=wt.texture,Ut.probesMin.value.copy(wt.boundingBox.min),Ut.probesMax.value.copy(wt.boundingBox.max),Ut.probesResolution.value.copy(wt.resolution)}Oa.upload(L,Ip(Re),Ut,J)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Oa.upload(L,Ip(Re),Ut,J),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&yt.setValue(L,"center",G.center),yt.setValue(L,"modelViewMatrix",G.modelViewMatrix),yt.setValue(L,"normalMatrix",G.normalMatrix),yt.setValue(L,"modelMatrix",G.matrixWorld),V.uniformsGroups!==void 0){let wt=V.uniformsGroups;for(let Xn=0,fr=wt.length;Xn<fr;Xn++){let Np=wt[Xn];oe.update(Np,Li),oe.bind(Np,Li)}}return Li}function p_(E,N){E.ambientLightColor.needsUpdate=N,E.lightProbe.needsUpdate=N,E.sunLights.needsUpdate=N,E.sunLightShadows.needsUpdate=N,E.directionalLights.needsUpdate=N,E.directionalLightShadows.needsUpdate=N,E.pointLights.needsUpdate=N,E.pointLightShadows.needsUpdate=N,E.spotLights.needsUpdate=N,E.spotLightShadows.needsUpdate=N,E.rectAreaLights.needsUpdate=N,E.hemisphereLights.needsUpdate=N}function m_(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return ne},this.setRenderTargetTextures=function(E,N,Y){let V=W.get(E);V.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),W.get(E.texture).__webglTexture=N,W.get(E.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:Y,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,N){let Y=W.get(E);Y.__webglFramebuffer=N,Y.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(E,N=0,Y=0){ne=E,X=N,k=Y;let V=null,G=!1,Ae=!1;if(E){let Ee=W.get(E);if(Ee.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(L.FRAMEBUFFER,Ee.__webglFramebuffer),$.copy(E.viewport),H.copy(E.scissor),Q=E.scissorTest,S.viewport($),S.scissor(H),S.setScissorTest(Q),q=-1;return}else if(Ee.__webglFramebuffer===void 0)J.setupRenderTarget(E);else if(Ee.__hasExternalTextures)J.rebindTextures(E,W.get(E.texture).__webglTexture,W.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let it=E.depthTexture;if(Ee.__boundDepthTexture!==it){if(it!==null&&W.has(it)&&(E.width!==it.image.width||E.height!==it.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");J.setupDepthRenderbuffer(E)}}let De=E.texture;(De.isData3DTexture||De.isDataArrayTexture||De.isCompressedArrayTexture)&&(Ae=!0);let Fe=W.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Fe[N])?V=Fe[N][Y]:V=Fe[N],G=!0):E.samples>0&&J.useMultisampledRTT(E)===!1?V=W.get(E).__webglMultisampledFramebuffer:Array.isArray(Fe)?V=Fe[Y]:V=Fe,$.copy(E.viewport),H.copy(E.scissor),Q=E.scissorTest}else $.copy(xe).multiplyScalar(se).floor(),H.copy(Oe).multiplyScalar(se).floor(),Q=at;if(Y!==0&&(V=O),S.bindFramebuffer(L.FRAMEBUFFER,V)&&S.drawBuffers(E,V),S.viewport($),S.scissor(H),S.setScissorTest(Q),G){let Ee=W.get(E.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,Ee.__webglTexture,Y)}else if(Ae){let Ee=N;for(let De=0;De<E.textures.length;De++){let Fe=W.get(E.textures[De]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+De,Fe.__webglTexture,Y,Ee)}}else if(E!==null&&Y!==0){let Ee=W.get(E.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ee.__webglTexture,Y)}q=-1};function Lp(E){let N=W.get(E);return(N.__readFormat!==E.format||N.__readType!==E.type)&&(N.__readFormat=E.format,N.__readType=E.type,N.__formatReadable=P.textureFormatReadable(E.format),N.__typeReadable=P.textureTypeReadable(E.type)),N}this.readRenderTargetPixels=function(E,N,Y,V,G,Ae,Pe,Ee=0){if(!(E&&E.isWebGLRenderTarget)){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let De=W.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Pe!==void 0&&(De=De[Pe]),De){S.bindFramebuffer(L.FRAMEBUFFER,De);try{let Fe=E.textures[Ee],it=Fe.format,lt=Fe.type;E.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ee);let Le=Lp(Fe);if(Le.__formatReadable===!1){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Le.__typeReadable===!1){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=E.width-V&&Y>=0&&Y<=E.height-G&&L.readPixels(N,Y,V,G,be.convert(it),be.convert(lt),Ae)}finally{let Fe=ne!==null?W.get(ne).__webglFramebuffer:null;S.bindFramebuffer(L.FRAMEBUFFER,Fe)}}},this.readRenderTargetPixelsAsync=async function(E,N,Y,V,G,Ae,Pe,Ee=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let De=W.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Pe!==void 0&&(De=De[Pe]),De)if(N>=0&&N<=E.width-V&&Y>=0&&Y<=E.height-G){S.bindFramebuffer(L.FRAMEBUFFER,De);let Fe=E.textures[Ee],it=Fe.format,lt=Fe.type;E.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ee);let Le=Lp(Fe);if(Le.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Le.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let gt=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,gt),L.bufferData(L.PIXEL_PACK_BUFFER,Ae.byteLength,L.STREAM_READ),L.readPixels(N,Y,V,G,be.convert(it),be.convert(lt),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let Ot=ne!==null?W.get(ne).__webglFramebuffer:null;S.bindFramebuffer(L.FRAMEBUFFER,Ot);let Et=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Vg(L,Et,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,gt),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Ae),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(gt),L.deleteSync(Et),Ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,N=null,Y=0){let V=Math.pow(2,-Y),G=Math.floor(E.image.width*V),Ae=Math.floor(E.image.height*V),Pe=N!==null?N.x:0,Ee=N!==null?N.y:0;J.setTexture2D(E,0),L.copyTexSubImage2D(L.TEXTURE_2D,Y,0,0,Pe,Ee,G,Ae),S.unbindTexture()},this.copyTextureToTexture=function(E,N,Y=null,V=null,G=0,Ae=0){let Pe,Ee,De,Fe,it,lt,Le,gt,Ot,Et=E.isCompressedTexture?E.mipmaps[Ae]:E.image;if(Y!==null)Pe=Y.max.x-Y.min.x,Ee=Y.max.y-Y.min.y,De=Y.isBox3?Y.max.z-Y.min.z:1,Fe=Y.min.x,it=Y.min.y,lt=Y.isBox3?Y.min.z:0;else{let Ut=Math.pow(2,-G);Pe=Math.floor(Et.width*Ut),Ee=Math.floor(Et.height*Ut),E.isDataArrayTexture?De=Et.depth:E.isData3DTexture?De=Math.floor(Et.depth*Ut):De=1,Fe=0,it=0,lt=0}V!==null?(Le=V.x,gt=V.y,Ot=V.z):(Le=0,gt=0,Ot=0);let Mt=be.convert(N.format),ei=be.convert(N.type),Re;N.isData3DTexture?(J.setTexture3D(N,0),Re=L.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(J.setTexture2DArray(N,0),Re=L.TEXTURE_2D_ARRAY):(J.setTexture2D(N,0),Re=L.TEXTURE_2D),S.activeTexture(L.TEXTURE0),S.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,N.flipY),S.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),S.pixelStorei(L.UNPACK_ALIGNMENT,N.unpackAlignment);let ci=S.getParameter(L.UNPACK_ROW_LENGTH),ht=S.getParameter(L.UNPACK_IMAGE_HEIGHT),Li=S.getParameter(L.UNPACK_SKIP_PIXELS),un=S.getParameter(L.UNPACK_SKIP_ROWS),Hn=S.getParameter(L.UNPACK_SKIP_IMAGES);S.pixelStorei(L.UNPACK_ROW_LENGTH,Et.width),S.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Et.height),S.pixelStorei(L.UNPACK_SKIP_PIXELS,Fe),S.pixelStorei(L.UNPACK_SKIP_ROWS,it),S.pixelStorei(L.UNPACK_SKIP_IMAGES,lt);let dr=E.isDataArrayTexture||E.isData3DTexture,yt=N.isDataArrayTexture||N.isData3DTexture;if(E.isDepthTexture){let Ut=W.get(E),Wn=W.get(N),wt=W.get(Ut.__renderTarget),Xn=W.get(Wn.__renderTarget);S.bindFramebuffer(L.READ_FRAMEBUFFER,wt.__webglFramebuffer),S.bindFramebuffer(L.DRAW_FRAMEBUFFER,Xn.__webglFramebuffer);for(let fr=0;fr<De;fr++)dr&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(E).__webglTexture,G,lt+fr),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(N).__webglTexture,Ae,Ot+fr)),L.blitFramebuffer(Fe,it,Pe,Ee,Le,gt,Pe,Ee,L.DEPTH_BUFFER_BIT,L.NEAREST);S.bindFramebuffer(L.READ_FRAMEBUFFER,null),S.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(G!==0||E.isRenderTargetTexture||W.has(E)){let Ut=W.get(E),Wn=W.get(N);S.bindFramebuffer(L.READ_FRAMEBUFFER,D),S.bindFramebuffer(L.DRAW_FRAMEBUFFER,B);for(let wt=0;wt<De;wt++)dr?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ut.__webglTexture,G,lt+wt):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ut.__webglTexture,G),yt?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Wn.__webglTexture,Ae,Ot+wt):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Wn.__webglTexture,Ae),G!==0?L.blitFramebuffer(Fe,it,Pe,Ee,Le,gt,Pe,Ee,L.COLOR_BUFFER_BIT,L.NEAREST):yt?L.copyTexSubImage3D(Re,Ae,Le,gt,Ot+wt,Fe,it,Pe,Ee):L.copyTexSubImage2D(Re,Ae,Le,gt,Fe,it,Pe,Ee);S.bindFramebuffer(L.READ_FRAMEBUFFER,null),S.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else yt?E.isDataTexture||E.isData3DTexture?L.texSubImage3D(Re,Ae,Le,gt,Ot,Pe,Ee,De,Mt,ei,Et.data):N.isCompressedArrayTexture?L.compressedTexSubImage3D(Re,Ae,Le,gt,Ot,Pe,Ee,De,Mt,Et.data):L.texSubImage3D(Re,Ae,Le,gt,Ot,Pe,Ee,De,Mt,ei,Et):E.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Ae,Le,gt,Pe,Ee,Mt,ei,Et.data):E.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Ae,Le,gt,Et.width,Et.height,Mt,Et.data):L.texSubImage2D(L.TEXTURE_2D,Ae,Le,gt,Pe,Ee,Mt,ei,Et);S.pixelStorei(L.UNPACK_ROW_LENGTH,ci),S.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ht),S.pixelStorei(L.UNPACK_SKIP_PIXELS,Li),S.pixelStorei(L.UNPACK_SKIP_ROWS,un),S.pixelStorei(L.UNPACK_SKIP_IMAGES,Hn),Ae===0&&N.generateMipmaps&&L.generateMipmap(Re),S.unbindTexture()},this.initRenderTarget=function(E){W.get(E).__webglFramebuffer===void 0&&J.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?J.setTextureCube(E,0):E.isData3DTexture?J.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?J.setTexture2DArray(E,0):J.setTexture2D(E,0),S.unbindTexture()},this.resetState=function(){X=0,k=0,ne=null,S.reset(),Ce.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return yi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(e),t.unpackColorSpace=nt._getUnpackColorSpace()}};var C0={type:"change"},lp={type:"start"},P0={type:"end"},Nu=new nn,R0=new vi,nw=Math.cos(70*Na.DEG2RAD),Yt=new C,bi=2*Math.PI,vt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},op=1e-6,Uu=class extends ma{constructor(e,t=null){super(e,t),this.state=vt.NONE,this.target=new C,this.cursor=new C,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Hi.ROTATE,MIDDLE:Hi.DOLLY,RIGHT:Hi.PAN},this.touches={ONE:Wi.ROTATE,TWO:Wi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new C,this._lastQuaternion=new bt,this._lastTargetPosition=new C,this._quat=new bt().setFromUnitVectors(e.up,new C(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new er,this._sphericalDelta=new er,this._scale=1,this._panOffset=new C,this._rotateStart=new Z,this._rotateEnd=new Z,this._rotateDelta=new Z,this._panStart=new Z,this._panEnd=new Z,this._panDelta=new Z,this._dollyStart=new Z,this._dollyEnd=new Z,this._dollyDelta=new Z,this._dollyDirection=new C,this._mouse=new Z,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=rw.bind(this),this._onPointerDown=sw.bind(this),this._onPointerUp=aw.bind(this),this._onContextMenu=fw.bind(this),this._onMouseWheel=cw.bind(this),this._onKeyDown=hw.bind(this),this._onTouchStart=uw.bind(this),this._onTouchMove=dw.bind(this),this._onMouseDown=ow.bind(this),this._onMouseMove=lw.bind(this),this._interceptControlDown=pw.bind(this),this._interceptControlUp=mw.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=vt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(C0),this.update(),this.state=vt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Yt.copy(t).sub(this.target),Yt.applyQuaternion(this._quat),this._spherical.setFromVector3(Yt),this.autoRotate&&this.state===vt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,n=this.maxAzimuthAngle;isFinite(i)&&isFinite(n)&&(i<-Math.PI?i+=bi:i>Math.PI&&(i-=bi),n<-Math.PI?n+=bi:n>Math.PI&&(n-=bi),i<=n?this._spherical.theta=Math.max(i,Math.min(n,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+n)/2?Math.max(i,this._spherical.theta):Math.min(n,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Yt.setFromSpherical(this._spherical),Yt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Yt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Yt.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new C(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new C(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Yt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Nu.origin.copy(this.object.position),Nu.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Nu.direction))<nw?this.object.lookAt(this.target):(R0.setFromNormalAndCoplanarPoint(this.object.up,this.target),Nu.intersectPlane(R0,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>op||8*(1-this._lastQuaternion.dot(this.object.quaternion))>op||this._lastTargetPosition.distanceToSquared(this.target)>op?(this.dispatchEvent(C0),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?bi/60*this.autoRotateSpeed*e:bi/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Yt.setFromMatrixColumn(t,0),Yt.multiplyScalar(-e),this._panOffset.add(Yt)}_panUp(e,t){this.screenSpacePanning===!0?Yt.setFromMatrixColumn(t,1):(Yt.setFromMatrixColumn(t,0),Yt.crossVectors(this.object.up,Yt)),Yt.multiplyScalar(e),this._panOffset.add(Yt)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let n=this.object.position;Yt.copy(n).sub(this.target);let r=Yt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),n=e-i.left,r=t-i.top,a=i.width,o=i.height;this._mouse.x=n/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(bi*this._rotateDelta.x/t.clientHeight),this._rotateUp(bi*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(bi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-bi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(bi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-bi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._rotateStart.set(i,n)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panStart.set(i,n)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,r=Math.sqrt(i*i+n*n);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),n=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(bi*this._rotateDelta.x/t.clientHeight),this._rotateUp(bi*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panEnd.set(i,n)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,r=Math.sqrt(i*i+n*n);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Z,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function sw(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function rw(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function aw(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(P0),this.state=vt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function ow(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Hi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=vt.DOLLY;break;case Hi.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=vt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=vt.ROTATE}break;case Hi.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=vt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=vt.PAN}break;default:this.state=vt.NONE}this.state!==vt.NONE&&this.dispatchEvent(lp)}function lw(s){switch(this.state){case vt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case vt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case vt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function cw(s){this.enabled===!1||this.enableZoom===!1||this.state!==vt.NONE||(s.preventDefault(),this.dispatchEvent(lp),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(P0))}function hw(s){this.enabled!==!1&&this._handleKeyDown(s)}function uw(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case Wi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(s),this.state=vt.TOUCH_ROTATE;break;case Wi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(s),this.state=vt.TOUCH_PAN;break;default:this.state=vt.NONE}break;case 2:switch(this.touches.TWO){case Wi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=vt.TOUCH_DOLLY_PAN;break;case Wi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=vt.TOUCH_DOLLY_ROTATE;break;default:this.state=vt.NONE}break;default:this.state=vt.NONE}this.state!==vt.NONE&&this.dispatchEvent(lp)}function dw(s){switch(this._trackPointer(s),this.state){case vt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case vt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case vt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case vt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=vt.NONE}}function fw(s){this.enabled!==!1&&s.preventDefault()}function pw(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function mw(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var za={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var Di=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},gw=new Gi(-1,1,1,-1,0,1),cp=class extends Ye{constructor(){super(),this.setAttribute("position",new Te([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Te([0,2,0,0,2,0],2))}},_w=new cp,ps=class{constructor(e){this._mesh=new st(_w,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,gw)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Fu=class extends Di{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Rt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=bn.clone(e.uniforms),this.material=new Rt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ps(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var fc=class extends Di{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){let n=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(n.REPLACE,n.REPLACE,n.REPLACE),r.buffers.stencil.setFunc(n.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(n.EQUAL,1,4294967295),r.buffers.stencil.setOp(n.KEEP,n.KEEP,n.KEEP),r.buffers.stencil.setLocked(!0)}},Ou=class extends Di{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Bu=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let i=e.getSize(new Z);this._width=i.width,this._height=i.height,t=new Ct(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Jt}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Fu(za),this.copyPass.material.blending=Pi,this.timer=new Qs}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),i=!1;for(let n=0,r=this.passes.length;n<r;n++){let a=this.passes[n];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(n),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),a.needsSwap){if(i){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}fc!==void 0&&(a instanceof fc?i=!0:a instanceof Ou&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new Z);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let i=this._width*this._pixelRatio,n=this._height*this._pixelRatio;this.renderTarget1.setSize(i,n),this.renderTarget2.setSize(i,n);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,n)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var zu=class extends Di{constructor(e,t,i=null,n=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=n,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new ae}render(e,t,i){let n=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=n}};var I0={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new ae(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var ka=class s extends Di{constructor(e,t=1,i,n){super(),this.strength=t,this.radius=i,this.threshold=n,this.resolution=e!==void 0?new Z(e.x,e.y):new Z(256,256),this.clearColor=new ae(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Ct(r,a,{type:Jt,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let d=new Ct(r,a,{type:Jt,depthBuffer:!1});d.texture.name="UnrealBloomPass.h"+h,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);let u=new Ct(r,a,{type:Jt,depthBuffer:!1});u.texture.name="UnrealBloomPass.v"+h,u.texture.generateMipmaps=!1,this.renderTargetsVertical.push(u),r=Math.round(r/2),a=Math.round(a/2)}let o=I0;this.highPassUniforms=bn.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=n,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Rt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new Z(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=bn.clone(za.uniforms),this.blendMaterial=new Rt({uniforms:this.copyUniforms,vertexShader:za.vertexShader,fragmentShader:za.fragmentShader,premultipliedAlpha:!0,blending:zn,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new ae,this._oldClearAlpha=1,this._basic=new dt,this._fsQuad=new ps(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),n=Math.round(t/2);this.renderTargetBright.setSize(i,n);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,n),this.renderTargetsVertical[r].setSize(i,n),this.separableBlurMaterials[r].uniforms.invSize.value=new Z(1/i,1/n),i=Math.round(i/2),n=Math.round(n/2)}render(e,t,i,n,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){let t=[],i=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(i*i))/i);let n=[],r=[];for(let a=1;a<e;a+=2){let o=t[a],l=a+1<e?t[a+1]:0,c=o+l;n.push((a*o+(a+1)*l)/c),r.push(c)}return new Rt({defines:{KERNEL_PAIRS:n.length},uniforms:{colorTexture:{value:null},invSize:{value:new Z(.5,.5)},direction:{value:new Z(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:n},gaussianWeights:{value:r}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Rt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};ka.BlurDirectionX=new Z(1,0);ka.BlurDirectionY=new Z(0,1);var pc={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var ku=class extends Di{constructor(){super(),this.isOutputPass=!0,this.uniforms=bn.clone(pc.uniforms),this.material=new os({name:pc.name,uniforms:this.uniforms,vertexShader:pc.vertexShader,fragmentShader:pc.fragmentShader}),this._fsQuad=new ps(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},nt.getTransfer(this._outputColorSpace)===ut&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===xa?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===va?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===ya?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===us?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ba?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Sa?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Ma&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};function D0(s,{random:e=Math.random,celestial:t=null}={}){if(typeof e!="function")throw new TypeError("Random must be a function");let i=()=>{let H=e();if(!Number.isFinite(H)||H<0||H>=1)throw new RangeError("Random must return a finite number in [0, 1)");return H},n=new s.Group;n.name="meteor-shower";let r=Array.from({length:qi},()=>({live:!1,age:0,life:0,startX:0,startY:0,endX:0,endY:0,x:0,y:0,tailLength:0,width:0,size:0,red:0,green:0,blue:0,launchId:0,launchRotation:new s.Quaternion,skyAspect:1,skyTanHalfFov:1})),a=[new s.Color("#b7deff").multiplyScalar(1.7),new s.Color("#ffe0ad").multiplyScalar(1.6)],o=!1,l=!1,c=0,h=0,d=0,u=0,f=0,p=0,_=2+i()*2,g=new s.Vector3,m=new Float32Array(qi*3),y=new Float32Array(qi*3),w=new Float32Array(qi),v=new Float32Array(qi),b=new s.BufferGeometry,M=(H,Q)=>new s.BufferAttribute(H,Q).setUsage(s.DynamicDrawUsage);b.setAttribute("position",M(m,3)),b.setAttribute("meteorColor",M(y,3)),b.setAttribute("meteorAlpha",M(w,1)),b.setAttribute("meteorSize",M(v,1)),b.setDrawRange(0,0);let A=new s.Points(b,new s.ShaderMaterial({transparent:!0,depthTest:!0,depthWrite:!1,toneMapped:!1,blending:s.AdditiveBlending,defines:t?{CELESTIAL_SKY:1}:{},uniforms:{...t?.uniforms,pixelRatio:{value:Math.min(2,globalThis.devicePixelRatio||1)}},vertexShader:xw,fragmentShader:vw}));A.name="meteor-heads",A.frustumCulled=!1,A.renderOrder=-996,A.visible=!1,n.add(A);let x=new Float32Array(qi*12),T=new Float32Array(qi*12),R=new Float32Array(qi*4),I=new Float32Array(qi*8),U=[];for(let H=0;H<qi;H+=1){let Q=H*4;U.push(Q,Q+1,Q+2,Q+2,Q+1,Q+3),I.set([0,0,0,1,1,0,1,1],H*8)}let O=new s.BufferGeometry;O.setAttribute("position",M(x,3)),O.setAttribute("meteorColor",M(T,3)),O.setAttribute("meteorAlpha",M(R,1)),O.setAttribute("uv",new s.BufferAttribute(I,2)),O.setIndex(U),O.setDrawRange(0,0);let D=new s.Mesh(O,new s.ShaderMaterial({transparent:!0,depthTest:!0,depthWrite:!1,toneMapped:!1,side:s.DoubleSide,blending:s.AdditiveBlending,defines:t?{CELESTIAL_SKY:1}:{},uniforms:{...t?.uniforms},vertexShader:yw,fragmentShader:Mw}));D.name="meteor-trails",D.frustumCulled=!1,D.renderOrder=-996,D.visible=!1,n.add(D);function B(){let H=r.find(He=>!He.live);if(!H)return;let Q=i();if(p===0)H.startX=-.88+i()*.26,H.startY=.86+Q*.08,H.endX=.1+i()*.34,H.endY=.64+i()*.12;else{let He=p===1?-1:1;H.startX=He*(.9+Q*.04),H.startY=.62+i()*.16,H.endX=He*(.73+i()*.1),H.endY=-.06-i()*.26}let Ie=a[i()<.72?0:1];H.live=!0,H.age=0,H.life=.72+i()*.36,H.x=H.startX,H.y=H.startY,H.tailLength=.19+i()*.12,H.width=.0036+i()*.0018,H.size=8.5+i()*2,H.red=Ie.r,H.green=Ie.g,H.blue=Ie.b,h+=1,H.launchId=h,t&&(H.launchRotation.copy(t.cameraQuaternion),H.skyAspect=t.uniforms.uSkyAspect.value,H.skyTanHalfFov=t.uniforms.uSkyTanHalfFov.value)}function X(H,Q,Ie,He,rt){if(!t){He.set([Q,Ie,.02],rt);return}g.set(Q*H.skyAspect*H.skyTanHalfFov,Ie*H.skyTanHalfFov,-1).normalize().applyQuaternion(H.launchRotation).toArray(He,rt)}function k(H,Q,Ie){return t?Object.freeze(g.set(Q*H.skyAspect*H.skyTanHalfFov,Ie*H.skyTanHalfFov,-1).normalize().applyQuaternion(H.launchRotation).toArray()):null}function ne(){for(let H of r)H.live=!1;c=0,f=0,A.visible=!1,D.visible=!1,b.setDrawRange(0,0),O.setDrawRange(0,0)}function q(){let H=0;for(let Q of r){if(!Q.live)continue;let Ie=Q.age/Q.life,He=Math.min(1,Q.age/.075)*Math.min(1,(1-Ie)/.24),rt=Q.endX-Q.startX,K=Q.endY-Q.startY,se=Math.hypot(rt,K),me=rt/se,Ve=K/se,xe=Math.min(Q.tailLength,se*Ie+.025),Oe=-Ve*Q.width,at=me*Q.width;X(Q,Q.x,Q.y,m,H*3),y.set([Q.red,Q.green,Q.blue],H*3),w[H]=He,v[H]=Q.size,x.set([Q.x-Oe,Q.y-at,.02,Q.x+Oe,Q.y+at,.02,Q.x-me*xe-Oe*.22,Q.y-Ve*xe-at*.22,.02,Q.x-me*xe+Oe*.22,Q.y-Ve*xe+at*.22,.02],H*12),t&&(X(Q,Q.x-Oe,Q.y-at,x,H*12),X(Q,Q.x+Oe,Q.y+at,x,H*12+3),X(Q,Q.x-me*xe-Oe*.22,Q.y-Ve*xe-at*.22,x,H*12+6),X(Q,Q.x-me*xe+Oe*.22,Q.y-Ve*xe+at*.22,x,H*12+9));for(let te=0;te<4;te+=1)T.set([Q.red,Q.green,Q.blue],H*12+te*3),R[H*4+te]=He;H+=1}c=H,A.visible=D.visible=H>0,b.setDrawRange(0,H),O.setDrawRange(0,H*6);for(let Q of Object.values(b.attributes))Q.needsUpdate=!0;for(let Q of["position","meteorColor","meteorAlpha"])O.attributes[Q].needsUpdate=!0}function ee(H,Q=!1){if(!o){if(Q){l=!0,ne();return}if(l){l=!1,_=2+i()*2;return}if(!(!Number.isFinite(H)||H<=0)){for(let Ie of r){if(!Ie.live)continue;if(Ie.age+=H,Ie.age>=Ie.life){Ie.live=!1,d+=1;continue}let He=Ie.age/Ie.life;Ie.x=Ie.startX+(Ie.endX-Ie.startX)*He,Ie.y=Ie.startY+(Ie.endY-Ie.startY)*He}if(_-=H,_<=0){if(f===0){u+=1,f=1+Math.floor(i()*qi);let Ie=i();p=Ie<.55?0:Ie<.775?1:2}B(),f-=1,_=f>0?.12+i()*.16:6+i()*6}q()}}}function $(){o||(o=!0,ne(),n.removeFromParent(),b.dispose(),A.material.dispose(),O.dispose(),D.material.dispose(),n.clear())}return Object.freeze({group:n,update:ee,dispose:$,capacity:qi,get activeCount(){return c},get launched(){return h},get launchCount(){return h},get completedCount(){return d},get groupCount(){return u},get nextIn(){return o||l?null:_},get activeMeteors(){return Object.freeze(r.filter(H=>H.live).map(H=>Object.freeze({x:H.x,y:H.y,progress:H.age/H.life,life:H.life,launchId:H.launchId,direction:k(H,H.x,H.y),startDirection:k(H,H.startX,H.startY),endDirection:k(H,H.endX,H.endY)})))}})}var qi=3,xw=`
  attribute vec3 meteorColor;
  attribute float meteorAlpha;
  attribute float meteorSize;
  uniform float pixelRatio;
  #ifdef CELESTIAL_SKY
    uniform mat4 uSkyView;
    uniform mat4 uSkyProjection;
  #endif
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = meteorColor;
    vAlpha = meteorAlpha;
    #ifdef CELESTIAL_SKY
      gl_Position = uSkyProjection * uSkyView * modelMatrix * vec4(position, 1.0);
    #else
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #endif
    gl_Position.z = gl_Position.w * 0.99990;
    gl_PointSize = meteorSize * pixelRatio;
  }
`,vw=`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.0, 0.32, radius);
    float halo = pow(max(0.0, 1.0 - radius), 2.5);
    float alpha = (core * 0.8 + halo * 0.38) * vAlpha;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(mix(vColor, vec3(2.0), core * 0.7), alpha);
  }
`,yw=`
  attribute vec3 meteorColor;
  attribute float meteorAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  varying vec2 vUv;
  #ifdef CELESTIAL_SKY
    uniform mat4 uSkyView;
    uniform mat4 uSkyProjection;
  #endif
  void main() {
    vColor = meteorColor;
    vAlpha = meteorAlpha;
    vUv = uv;
    #ifdef CELESTIAL_SKY
      gl_Position = uSkyProjection * uSkyView * modelMatrix * vec4(position, 1.0);
    #else
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #endif
    gl_Position.z = gl_Position.w * 0.99990;
  }
`,Mw=`
  varying vec3 vColor;
  varying float vAlpha;
  varying vec2 vUv;
  void main() {
    float across = 1.0 - smoothstep(0.0, 0.5, abs(vUv.y - 0.5));
    float along = pow(1.0 - vUv.x, 1.7);
    float alpha = across * along * vAlpha * 0.85;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;var bw=Object.freeze(["sun","mercury","venus","earth","mars","jupiter","saturn","uranus","neptune","pluto"]);function L0(s,{noise:e,sharedUniforms:t={},vertexShader:i}){if(!e?.isTexture)throw new TypeError("A shared noise texture is required");if(typeof i!="string"||!i.trim())throw new TypeError("A vertex shader providing vUv is required");let n=new Set,r=!1,a=(o,l)=>{let c=t[o]?.value??l;return{value:c?.clone?c.clone():c}};return{createBodyMaterial(o){if(r)throw new Error("Celestial materials have been disposed");let l=bw.indexOf(o);if(l<0)throw new RangeError(`Unknown celestial body: ${String(o)}`);let c=new s.ShaderMaterial({name:`celestial-${o}-surface`,defines:{BODY_KIND:l},uniforms:{...t,uNoise:{value:e},uWorldToBody:a("uWorldToBody",new s.Matrix3),uViewRight:a("uViewRight",new s.Vector3(1,0,0)),uViewUp:a("uViewUp",new s.Vector3(0,1,0)),uViewForward:a("uViewForward",new s.Vector3(0,0,1)),uSunDirection:a("uSunDirection",new s.Vector3(-.65,.48,.58).normalize()),uPhase:a("uPhase",0)},vertexShader:i,fragmentShader:Sw,transparent:!0,depthTest:!0,depthWrite:!0,toneMapped:!1});return c.userData.celestialKind=o,n.add(c),c},dispose(){if(!r){r=!0;for(let o of n)o.dispose();n.clear()}}}}var Sw=`
  uniform sampler2D uNoise;
  uniform mat3 uWorldToBody;
  uniform vec3 uViewRight;
  uniform vec3 uViewUp;
  uniform vec3 uViewForward;
  uniform vec3 uSunDirection;
  uniform float uPhase;
  varying vec2 vUv;

  float square(float x) { return x * x; }
  float noise2(vec2 p) {
    vec2 cell = floor(p);
    vec2 fraction = fract(p);
    fraction = fraction * fraction * (3.0 - 2.0 * fraction);
    return texture2D(uNoise, (cell + 0.5 + fraction) / 128.0).r;
  }
  float fbm(vec2 p) {
    return noise2(p) * 0.55
      + noise2(p * 2.03 + 11.7) * 0.27
      + noise2(p * 4.11 + 27.1) * 0.12
      + noise2(p * 8.17 + 5.4) * 0.06;
  }
  float surfaceNoise(vec3 p) {
    return fbm(p.xy + vec2(p.z * 0.73, p.z * 1.37)) * 0.6
      + fbm(p.yz + vec2(p.x * 1.19, p.x * 0.41)) * 0.4;
  }
  float wrappedLongitude(float longitude) {
    return atan(sin(longitude), cos(longitude));
  }
  float oval(vec2 uv, vec2 center, vec2 radii) {
    vec2 delta = uv - center;
    delta.x = wrappedLongitude(delta.x);
    delta /= radii;
    return 1.0 - smoothstep(0.72, 1.13, dot(delta, delta));
  }
  float craterRelief(vec3 p) {
    float relief = 0.0;
    for (int i = 0; i < 12; i++) {
      float index = float(i) + 1.0;
      vec3 center = normalize(vec3(
        sin(index * 12.71), sin(index * 4.13 + 1.0), cos(index * 8.31)
      ));
      float radius = 0.07 + fract(sin(index * 17.23) * 431.7) * 0.17;
      float distanceToRim = length(p - center) / radius;
      float bowl = 1.0 - smoothstep(0.42, 0.9, distanceToRim);
      float rim = exp(-square((distanceToRim - 1.02) * 8.5));
      relief += rim * 0.12 - bowl * 0.19;
    }
    return relief;
  }

  void main() {
    vec2 disc = vUv * 2.0 - 1.0;
    float radiusSquared = dot(disc, disc);
    if (radiusSquared >= 1.0) discard;
    float facing = sqrt(max(0.0, 1.0 - radiusSquared));
    vec3 normalWorld = normalize(
      disc.x * uViewRight + disc.y * uViewUp + facing * uViewForward
    );
    vec3 body = normalize(uWorldToBody * normalWorld);
    float sine = sin(uPhase), cosine = cos(uPhase);
    body.xz = mat2(cosine, -sine, sine, cosine) * body.xz;
    vec2 uv = vec2(atan(body.x, body.z), asin(clamp(body.y, -1.0, 1.0)));
    vec3 surface;
    vec3 atmosphere = vec3(0.0);
    float fill = 0.31;

    #if BODY_KIND == 0
      // \u592A\u9633\uFF1A\u8D6D\u91D1\u9897\u7C92\u3001\u6697\u8272\u592A\u9633\u9ED1\u5B50\u4E0E\u6E29\u548C\u4E34\u8FB9\u53D8\u6697\uFF0C\u907F\u514D\u7EAF\u767D\u5149\u997C\u3002
      float granules = surfaceNoise(body * 31.0);
      float cells = surfaceNoise(body * 70.0);
      float broad = surfaceNoise(body * 5.0);
      surface = mix(vec3(0.48, 0.14, 0.018), vec3(0.88, 0.49, 0.105), granules);
      surface *= 0.86 + cells * 0.23 + broad * 0.11;
      float spots = oval(uv, vec2(-0.33, 0.18), vec2(0.06, 0.045))
        + oval(uv, vec2(-0.25, 0.22), vec2(0.037, 0.028));
      surface *= 1.0 - clamp(spots, 0.0, 1.0) * 0.62;
      surface *= 0.61 + 0.39 * pow(facing, 0.45);

    #elif BODY_KIND == 1
      // \u6C34\u661F\uFF1A\u7070\u8910\u5CA9\u9762\u3001\u5927\u5C0F\u4E0D\u540C\u7684\u649E\u51FB\u5751\u4E0E\u7EC6\u788E\u660E\u6697\u3002
      float terrain = surfaceNoise(body * 9.0);
      surface = mix(vec3(0.22, 0.205, 0.175), vec3(0.47, 0.435, 0.365), terrain);
      surface += craterRelief(body);
      surface *= 0.9 + surfaceNoise(body * 43.0) * 0.2;
      fill = 0.34;

    #elif BODY_KIND == 2
      // \u91D1\u661F\uFF1A\u5B8C\u5168\u8986\u76D6\u8868\u9762\u7684\u6DE1\u91D1\u4E91\u5C42\uFF0C\u5BBD\u4E91\u5E26\u4E0E\u7EC6\u6DA1\u7EB9\u5E76\u5B58\u3002
      float turbulence = surfaceNoise(body * vec3(4.0, 10.0, 4.0));
      float flow = uv.y * 13.0 + sin(uv.x * 3.0) * 0.8 + turbulence * 4.7;
      float clouds = 0.5 + 0.5 * sin(flow);
      surface = mix(vec3(0.51, 0.35, 0.16), vec3(0.81, 0.69, 0.43), clouds * 0.53 + turbulence * 0.47);
      surface *= 0.94 + surfaceNoise(body * 24.0) * 0.12;
      atmosphere = vec3(0.045, 0.032, 0.012);

    #elif BODY_KIND == 3
      // \u5730\u7403\uFF1A\u84DD\u6D77\u3001\u53EF\u8FA8\u8BC6\u7684\u5927\u9646\u5206\u5E03\u3001\u6781\u5730\u4E0E\u72EC\u7ACB\u767D\u4E91\u5C42\u3002
      float terrain = surfaceNoise(body * 11.0);
      float broad = surfaceNoise(body * 4.0);
      vec2 coast = uv + vec2(terrain - 0.5, broad - 0.5) * 0.17;
      float land = oval(coast, vec2(-1.68, 0.65), vec2(0.68, 0.38));
      land = max(land, oval(coast, vec2(-1.04, -0.38), vec2(0.30, 0.63)));
      land = max(land, oval(coast, vec2(0.14, 0.02), vec2(0.39, 0.59)));
      land = max(land, oval(coast, vec2(0.3, 0.68), vec2(0.60, 0.27)));
      land = max(land, oval(coast, vec2(1.13, 0.56), vec2(0.87, 0.40)));
      land = max(land, oval(coast, vec2(2.21, -0.51), vec2(0.40, 0.24)));
      land = smoothstep(0.38, 0.64, land + (terrain - 0.5) * 0.17);
      vec3 ocean = mix(vec3(0.025, 0.095, 0.23), vec3(0.045, 0.20, 0.37), broad);
      float desert = oval(uv, vec2(0.30, 0.25), vec2(0.46, 0.23));
      vec3 ground = mix(vec3(0.10, 0.25, 0.14), vec3(0.39, 0.33, 0.18), terrain);
      ground = mix(ground, vec3(0.53, 0.42, 0.23), desert * 0.76);
      surface = mix(ocean, ground, land);
      float ice = smoothstep(1.01, 1.24, abs(uv.y));
      surface = mix(surface, vec3(0.78, 0.83, 0.81), ice);
      float cloudNoise = surfaceNoise(body * vec3(10.0, 15.0, 10.0));
      float clouds = smoothstep(0.54, 0.69, cloudNoise + sin(uv.y * 19.0 + broad * 5.0) * 0.055);
      surface = mix(surface, vec3(0.82, 0.85, 0.83), clouds * 0.82);
      atmosphere = vec3(0.015, 0.065, 0.11);
      fill = 0.34;

    #elif BODY_KIND == 4
      // \u706B\u661F\uFF1A\u94C1\u9508\u7EA2\u5730\u8C8C\u3001\u6697\u8272\u5CE1\u8C37\u4E0E\u5C0F\u9762\u79EF\u6781\u51A0\u3002
      float terrain = surfaceNoise(body * 8.0);
      surface = mix(vec3(0.27, 0.09, 0.044), vec3(0.66, 0.30, 0.12), terrain);
      float canyon = exp(-square((uv.y + 0.13 + sin(uv.x * 4.0) * 0.035) / 0.024));
      canyon *= oval(uv, vec2(0.06, -0.13), vec2(0.63, 0.23));
      surface *= 1.0 - canyon * 0.36;
      surface += craterRelief(body) * 0.32;
      surface *= 0.93 + surfaceNoise(body * 39.0) * 0.14;
      float ice = smoothstep(1.20, 1.36, abs(uv.y) + (terrain - 0.5) * 0.1);
      surface = mix(surface, vec3(0.65, 0.62, 0.52), ice);
      atmosphere = vec3(0.028, 0.008, 0.003);

    #elif BODY_KIND == 5
      // \u6728\u661F\uFF1A\u5468\u671F\u8FDE\u7EED\u7684\u8D64\u9053\u4E91\u5E26\u4E0E\u5357\u534A\u7403\u692D\u5706\u5927\u7EA2\u6591\u3002
      float turbulence = surfaceNoise(body * vec3(4.0, 11.0, 4.0));
      float flow = uv.y + (turbulence - 0.5) * 0.07 + sin(uv.x * 5.0 + uv.y * 13.0) * 0.01;
      float northBelt = exp(-square((flow - 0.24) / 0.09));
      float southBelt = exp(-square((flow + 0.22) / 0.10));
      float bandWave = 0.5 + 0.5 * sin(flow * 18.0 + 0.8);
      float belts = clamp(northBelt * 0.9 + southBelt * 0.82 + bandWave * bandWave * bandWave * 0.42, 0.0, 1.0);
      surface = mix(vec3(0.67, 0.57, 0.42), vec3(0.33, 0.18, 0.083), belts);
      surface *= 0.91 + sin(flow * 38.0 + turbulence * 2.5) * 0.045 + turbulence * 0.15;
      surface *= 0.95 + surfaceNoise(body * vec3(48.0, 100.0, 48.0)) * 0.10;
      vec2 spot = vec2(wrappedLongitude(uv.x + 0.35) / 0.235, (uv.y + 0.34) / 0.112);
      float radius = length(spot);
      float swirl = sin(atan(spot.y, spot.x) * 2.0 + radius * 13.0 - turbulence * 2.0);
      float edge = 1.0 - smoothstep(0.8, 1.16, radius + swirl * 0.055);
      float rim = exp(-square((radius - 1.02) / 0.18));
      surface = mix(surface, vec3(0.76, 0.60, 0.38), rim * 0.32);
      vec3 redSpot = mix(vec3(0.35, 0.09, 0.035), vec3(0.62, 0.26, 0.11), 0.4 + swirl * 0.17 + turbulence * 0.25);
      surface = mix(surface, redSpot, edge * 0.95);
      atmosphere = vec3(0.022, 0.018, 0.010);

    #elif BODY_KIND == 6
      // \u571F\u661F\uFF1A\u4F4E\u5BF9\u6BD4\u7684\u6696\u6D45\u91D1\u4E91\u5E26\uFF0C\u8FA8\u8BC6\u91CD\u70B9\u7531\u5BBF\u4E3B\u72EC\u7ACB\u7ED8\u5236\u7684\u73AF\u627F\u62C5\u3002
      float turbulence = surfaceNoise(body * vec3(3.0, 9.0, 3.0));
      float bands = 0.5 + 0.5 * sin(uv.y * 28.0 + turbulence * 2.2);
      surface = mix(vec3(0.59, 0.47, 0.27), vec3(0.82, 0.72, 0.47), bands * 0.42 + turbulence * 0.38);
      float equator = exp(-square(uv.y / 0.28));
      surface = mix(surface, vec3(0.76, 0.67, 0.45), equator * 0.24);
      atmosphere = vec3(0.032, 0.025, 0.012);

    #elif BODY_KIND == 7
      // \u5929\u738B\u661F\uFF1A\u67D4\u548C\u9752\u74F7\u8272\u4E0E\u6781\u5F31\u4E91\u5E26\uFF0C\u907F\u514D\u4E0E\u6D77\u738B\u661F\u540C\u4E3A\u6DF1\u84DD\u3002
      float turbulence = surfaceNoise(body * vec3(3.0, 7.0, 3.0));
      surface = mix(vec3(0.24, 0.48, 0.49), vec3(0.43, 0.68, 0.65), turbulence);
      surface *= 0.98 + sin(uv.y * 17.0 + turbulence) * 0.022;
      atmosphere = vec3(0.016, 0.055, 0.061);
      fill = 0.34;

    #elif BODY_KIND == 8
      // \u6D77\u738B\u661F\uFF1A\u9971\u548C\u94B4\u84DD\u3001\u6DF1\u8272\u98CE\u66B4\u4E0E\u5C11\u91CF\u660E\u4EAE\u9AD8\u4E91\u3002
      float turbulence = surfaceNoise(body * vec3(5.0, 9.0, 5.0));
      float bands = 0.5 + 0.5 * sin(uv.y * 16.0 + turbulence * 2.2);
      surface = mix(vec3(0.034, 0.085, 0.29), vec3(0.095, 0.27, 0.61), bands * 0.38 + turbulence * 0.50);
      float storm = oval(uv, vec2(-0.27, -0.22), vec2(0.27, 0.105));
      surface = mix(surface, vec3(0.035, 0.073, 0.18), storm * 0.77);
      float cloud = exp(-square((uv.y + 0.38 + sin(uv.x * 3.0) * 0.018) / 0.014));
      cloud *= oval(uv, vec2(0.1, -0.38), vec2(0.44, 0.08));
      surface = mix(surface, vec3(0.60, 0.72, 0.79), cloud * 0.58);
      atmosphere = vec3(0.008, 0.023, 0.082);
      fill = 0.39;

    #else
      // \u51A5\u738B\u661F\uFF1A\u51B7\u6696\u6591\u9A73\u5730\u8C8C\u4E0E\u6D45\u8272\u5FC3\u5F62\u533A\u57DF\uFF0C\u533A\u522B\u4E8E\u5C0F\u578B\u5CA9\u8D28\u6C34\u661F\u3002
      float terrain = surfaceNoise(body * 8.0);
      surface = mix(vec3(0.22, 0.12, 0.095), vec3(0.63, 0.47, 0.33), terrain);
      surface *= 0.92 + surfaceNoise(body * 28.0) * 0.15;
      vec2 heart = vec2(wrappedLongitude(uv.x - 0.03) / 0.43, (uv.y + 0.08) / 0.37);
      float base = dot(heart, heart) - 1.0;
      float shape = base * base * base - heart.x * heart.x * heart.y * heart.y * heart.y;
      float ice = 1.0 - smoothstep(-0.07, 0.07, shape + (terrain - 0.5) * 0.10);
      surface = mix(surface, vec3(0.79, 0.74, 0.62), ice * 0.95);
      fill = 0.37;
    #endif

    #if BODY_KIND != 0
      // \u4FDD\u7559\u4E0D\u540C\u76F8\u4F4D\u4E0E\u7ACB\u4F53\u5149\u7167\uFF0C\u540C\u65F6\u7528\u67D4\u548C\u586B\u5145\u907F\u514D\u80CC\u5149\u9762\u878D\u5165\u80CC\u666F\u3002
      float sun = dot(normalWorld, normalize(uSunDirection));
      float terminator = smoothstep(-0.18, 0.16, sun);
      float lighting = fill + terminator * (0.13 + max(0.0, sun) * 0.53);
      float limb = 0.69 + 0.31 * pow(facing, 0.42);
      surface = max(surface, vec3(0.0)) * lighting * limb;
      float atmosphereRim = square(1.0 - facing);
      surface += atmosphere * atmosphereRim * (0.28 + terminator * 0.45);
    #endif

    // \u5706\u76D8\u8FB9\u7F18\u53EA\u505A\u50CF\u7D20\u7EA7\u6297\u952F\u9F7F\uFF0C\u4E0D\u6269\u5927\u53D1\u5149\u8F6E\u5ED3\u6216\u5236\u9020\u989D\u5916\u5149\u73AF\u3002
    float aa = max(fwidth(radiusSquared) * 1.2, 0.0015);
    float alpha = 1.0 - smoothstep(1.0 - aa, 1.0, radiusSquared);
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(clamp(surface, 0.0, 0.92), alpha);
    #include <colorspace_fragment>
  }
`;var ww=100,Tw=1.4,Ew=Object.freeze([{id:"jupiter",name:"Jupiter",radius:6.4,yaw:30,elevation:20,tilt:.03},{id:"earth",name:"Earth",radius:4.8,yaw:83,elevation:19,tilt:.24},{id:"saturn",name:"Saturn",radius:4.5,yaw:169,elevation:22,tilt:-.48},{id:"sun",name:"Sun",radius:6.9,yaw:-111,elevation:26,tilt:0},{id:"mercury",name:"Mercury",radius:2.5,yaw:-76,elevation:-23,tilt:.04},{id:"venus",name:"Venus",radius:4,yaw:-25,elevation:-44,tilt:-.12},{id:"mars",name:"Mars",radius:3.4,yaw:144,elevation:-32,tilt:.18},{id:"uranus",name:"Uranus",radius:3.5,yaw:-43,elevation:68,tilt:1.25},{id:"neptune",name:"Neptune",radius:3.7,yaw:73,elevation:-67,tilt:-.18},{id:"pluto",name:"Pluto",radius:2.6,yaw:-139,elevation:-55,tilt:.3}]);function U0(s,{noise:e,celestial:t,depths:i}){let n=new s.Group;n.name="solar-system-scenery";let r=new s.PlaneGeometry(2,2),a=new s.RingGeometry(1.27,2.26,128),o=L0(s,{noise:e,sharedUniforms:t.uniforms,vertexShader:N0}),l=[],c=Ew.map(v=>{let b=Math.atan(Math.tan(s.MathUtils.degToRad(v.radius))*Tw),M=o.createBodyMaterial(v.id);Object.assign(M.uniforms,{uAngularRadius:{value:b},uExtent:{value:1},uFarDepth:{value:i.planet}}),M.depthTest=!0,M.depthWrite=!0;let A=new s.Mesh(r,M);A.name=v.id,A.renderOrder=-999,A.userData.farDepth=i.planet,n.add(A);let x={...v,mesh:A,material:M,angularRadius:b,ring:null,corona:null,direction:new s.Vector3,light:new s.Vector3,ndc:[0,0],radiusNdc:[0,0],visible:!1};if(v.id==="saturn"){let T=new s.ShaderMaterial({uniforms:M.uniforms,vertexShader:Aw,fragmentShader:Cw,transparent:!0,depthTest:!0,depthWrite:!1,side:s.DoubleSide,toneMapped:!1}),R=new s.Mesh(a,T);R.name="saturn-rings",R.renderOrder=-997,R.userData.farDepth=i.planet,n.add(R),l.push(T),x.ring=R}if(v.id==="sun"){let T=new s.ShaderMaterial({uniforms:{...M.uniforms,uExtent:{value:1.8},uFarDepth:{value:i.planet+1e-6}},vertexShader:N0,fragmentShader:Rw,transparent:!0,blending:s.AdditiveBlending,depthTest:!0,depthWrite:!1,toneMapped:!1}),R=new s.Mesh(r,T);R.name="solar-corona",R.renderOrder=-997,R.userData.farDepth=i.planet+1e-6,n.add(R),l.push(T),x.corona=R}return x}),h=new s.Vector3,d=new s.Vector3,u=new s.Vector3,f=new s.Vector3,p=new s.Vector3,_=new s.Vector3,g=new s.Vector3,m=new s.Matrix3,y=!1,w=!1;return n.traverse(v=>{v.frustumCulled=!1,v.userData.backgroundOnly=!0,v.isMesh&&(v.raycast=()=>{})}),{group:n,bodies:c,anchor({aspect:v,tanHalfFov:b}){if(!(y||w)){for(let M of c){let A=s.MathUtils.degToRad(M.yaw),x=s.MathUtils.degToRad(M.elevation);M.mesh.position.set(Math.sin(A)*Math.cos(x),Math.sin(x),-Math.cos(A)*Math.cos(x)),M.id==="jupiter"&&M.mesh.position.set(.68*v*b,.66*b,-1),M.mesh.position.normalize().multiplyScalar(ww),f.copy(M.mesh.position).negate().normalize(),d.set(1,0,0).addScaledVector(f,-f.x).normalize(),u.crossVectors(f,d).normalize();let T=new s.Matrix4().makeBasis(d,u,f);M.mesh.quaternion.setFromRotationMatrix(T),M.mesh.rotateZ(M.tilt),M.id==="saturn"&&M.mesh.rotateX(.48);for(let R of[M.ring,M.corona])R&&(R.position.copy(M.mesh.position),R.quaternion.copy(M.mesh.quaternion))}n.updateWorldMatrix(!0,!0);for(let M of c)M.light.set(-.5,.4,.7).normalize().applyQuaternion(M.mesh.getWorldQuaternion(new s.Quaternion));y=!0}},update(v,b){if(!y||w)return;n.updateWorldMatrix(!0,!0),h.set(1,0,0).applyQuaternion(b.quaternion);let M=t.uniforms.uSkyAspect.value,A=t.uniforms.uSkyTanHalfFov.value;for(let x of c){x.mesh.getWorldPosition(p),x.direction.copy(p).normalize(),f.copy(x.direction).negate(),d.copy(h).addScaledVector(f,-h.dot(f)),d.lengthSq()<1e-6&&d.set(0,1,0).addScaledVector(f,-f.y),d.normalize(),u.crossVectors(f,d).normalize();let T=x.material.uniforms;T.uViewRight.value.copy(d),T.uViewUp.value.copy(u),T.uViewForward.value.copy(f),T.uWorldToBody.value.copy(m.setFromMatrix4(x.mesh.matrixWorld).invert()),T.uSunDirection.value.copy(x.light),T.uPhase.value=v*(x.id==="sun"?.022:.0016),g.copy(p).project(b),_.copy(p).applyMatrix4(b.matrixWorldInverse);let R=Math.tan(x.angularRadius)/A;x.ndc[0]=g.x,x.ndc[1]=g.y,x.radiusNdc[0]=R/M,x.radiusNdc[1]=R;let I=x.ring?2.26:x.corona?1.8:1;x.visible=_.z<0&&Math.abs(g.x)<1+R*I/M&&Math.abs(g.y)<1+R*I,x.mesh.visible=x.visible,x.ring&&(x.ring.visible=x.visible),x.corona&&(x.corona.visible=x.visible)}},dispose(){if(!w){w=!0,o.dispose();for(let v of l)v.dispose();r.dispose(),a.dispose(),n.removeFromParent(),n.clear()}}}}var F0=`
  uniform mat4 uSkyView;
  uniform mat4 uSkyProjection;
  uniform float uSkyAspect;
  uniform float uSkyTanHalfFov;
  uniform float uAngularRadius;
  uniform float uFarDepth;
  vec4 projectDisc(vec2 offset, float depthOffset) {
    vec4 center = uSkyView * modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    if (center.z >= -0.001) return vec4(2.0, 2.0, 2.0, 1.0);
    vec4 clip = uSkyProjection * center;
    float radius = tan(uAngularRadius) / uSkyTanHalfFov;
    vec2 point = clip.xy / clip.w + offset * radius / vec2(uSkyAspect, 1.0);
    return vec4(point, uFarDepth + depthOffset, 1.0);
  }
`,N0=`
  ${F0}
  uniform float uExtent;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectDisc(position.xy * uExtent, 0.0);
  }
`,Aw=`
  ${F0}
  uniform vec3 uViewRight;
  uniform vec3 uViewUp;
  uniform vec3 uViewForward;
  varying float vRadius;
  varying float vLight;
  void main() {
    vec3 world = mat3(modelMatrix) * vec3(position.x, 0.0, position.y);
    vec2 offset = vec2(dot(world, uViewRight), dot(world, uViewUp));
    float front = dot(world, uViewForward);
    vRadius = length(position.xy);
    vLight = 0.82 + 0.18 * smoothstep(-1.0, 1.0, position.x);
    gl_Position = projectDisc(offset, -front * 0.000002);
  }
`,Cw=`
  varying float vRadius;
  varying float vLight;
  void main() {
    float bands = 0.72 + 0.16 * sin(vRadius * 140.0) + 0.08 * sin(vRadius * 391.0);
    float cassini = smoothstep(1.86, 1.89, vRadius) * (1.0 - smoothstep(1.93, 1.96, vRadius));
    float rim = smoothstep(1.27, 1.34, vRadius) * (1.0 - smoothstep(2.17, 2.26, vRadius));
    vec3 color = mix(vec3(0.26, 0.18, 0.095), vec3(0.54, 0.43, 0.28), bands) * vLight;
    float alpha = rim * (0.52 + bands * 0.26) * (1.0 - cassini * 0.94);
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`,Rw=`
  uniform float uPhase;
  varying vec2 vUv;
  void main() {
    vec2 point = (vUv * 2.0 - 1.0) * 1.8;
    float radius = length(point);
    if (radius < 1.0 || radius > 1.8) discard;
    float angle = atan(point.y, point.x);
    float rays = 0.72 + 0.12 * sin(angle * 17.0 + uPhase) + 0.08 * sin(angle * 37.0 - uPhase);
    float alpha = exp(-(radius - 1.0) * 8.5) * (1.0 - smoothstep(1.45, 1.8, radius)) * rays * 0.38;
    gl_FragColor = vec4(vec3(0.70, 0.27, 0.055), alpha);
    #include <colorspace_fragment>
  }
`;var Va=Object.freeze({galaxy:.99998,stars:.99996,planet:.99993,atmosphere:.99992,meteors:.9999}),Vu=100,hp=60;function O0(s){let e=new s.Group;e.name="cosmic_environment",e.visible=!1;let t=new s.Group;t.name="anchored-celestial-sky",e.add(t);let i=new s.PerspectiveCamera(hp,1,.1,300),n=new s.Quaternion,r={cameraQuaternion:n,uniforms:{uSkyView:{value:i.matrixWorldInverse},uSkyProjection:{value:i.projectionMatrix},uSkyAspect:{value:1},uSkyTanHalfFov:{value:Math.tan(hp*Math.PI/360)}}},a=Dw(729401),o=new Uint8Array(16384);for(let k=0;k<o.length;k++)o[k]=Math.floor(a()*256);let l=new s.DataTexture(o,128,128,s.RedFormat);l.wrapS=l.wrapT=s.RepeatWrapping,l.magFilter=l.minFilter=s.LinearFilter,l.generateMipmaps=!1,l.needsUpdate=!0;let c=r.uniforms.uSkyTanHalfFov.value,h=new s.Vector3(-.3,1,.08*c).normalize(),d=new s.Vector3(1,.3,0).normalize(),u=new s.Vector3().crossVectors(h,d).normalize(),f=new s.Matrix3().set(d.x,h.x,u.x,d.y,h.y,u.y,d.z,h.z,u.z),p=new s.Matrix3,_=new s.Matrix3,g=new s.ShaderMaterial({uniforms:{uNoise:{value:l},uAspect:r.uniforms.uSkyAspect,uTanHalfFov:r.uniforms.uSkyTanHalfFov,uCameraToWorld:{value:_},uGalaxyFromWorld:{value:p}},depthTest:!0,depthWrite:!1,toneMapped:!1,vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, ${Va.galaxy}, 1.0);
      }
    `,fragmentShader:Iw}),m=new s.Mesh(new s.PlaneGeometry(2,2),g);m.name="milky-way",m.renderOrder=-1e3,m.userData.farDepth=Va.galaxy,e.add(m);let y=[],w=[],v=[],b=new s.Vector3;for(let k=0;k<5200;k++){let ne=a()*Math.PI*2;if(k<2e3){let $=(a()+a()+a()-1.5)*.13;b.set(Math.sin(ne)*Math.cos($),Math.sin($),Math.cos(ne)*Math.cos($)).applyMatrix3(f)}else{let $=a()*2-1,H=Math.sqrt(1-$*$);b.set(Math.cos(ne)*H,$,Math.sin(ne)*H)}y.push(b.x*Vu,b.y*Vu,b.z*Vu);let q=.16+Math.pow(a(),5)*.66,ee=a()>.74;w.push(q*(ee?1:.73),q*(ee?.87:.84),q*(ee?.66:1)),v.push(.7+Math.pow(a(),2)*1.6)}let M=new s.BufferGeometry;M.setAttribute("position",new s.Float32BufferAttribute(y,3)),M.setAttribute("color",new s.Float32BufferAttribute(w,3)),M.setAttribute("aSize",new s.Float32BufferAttribute(v,1));let A=new s.ShaderMaterial({transparent:!0,depthTest:!0,depthWrite:!1,blending:s.AdditiveBlending,toneMapped:!1,uniforms:{...r.uniforms,uTime:{value:0},uPixelRatio:{value:Math.min(globalThis.devicePixelRatio||1,1.75)}},vertexShader:`
      attribute vec3 color;
      attribute float aSize;
      uniform mat4 uSkyView;
      uniform mat4 uSkyProjection;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      void main() {
        vColor = color * (0.975 + 0.025 * sin(uTime * 0.4 + position.x * 0.31));
        gl_PointSize = aSize * uPixelRatio;
        gl_Position = uSkyProjection * uSkyView * modelMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w * ${Va.stars};
      }
    `,fragmentShader:`
      varying vec3 vColor;
      void main() {
        float radius = length(gl_PointCoord * 2.0 - 1.0);
        if (radius > 1.0) discard;
        gl_FragColor = vec4(vColor, pow(1.0 - radius, 1.35));
        #include <colorspace_fragment>
      }
    `}),x=new s.Points(M,A);x.name="background-starfield",x.renderOrder=-998,x.userData.farDepth=Va.stars,t.add(x);let T=U0(s,{noise:l,celestial:r,depths:Va});t.add(T.group);let R=T.bodies.find(k=>k.id==="jupiter"),I=R.mesh,U=D0(s,{celestial:r});e.add(U.group),e.traverse(k=>{k.frustumCulled=!1,k.userData.backgroundOnly=!0,(k.isMesh||k.isPoints||k.isLine)&&(k.raycast=()=>{})});let O={aspect:1,skyFov:hp,distance:Vu,anchored:!1,planetNdc:[0,0],planetDirection:[0,0,-1],planetRadiusNdc:[0,0],planetVisible:!1,depths:Va},D=new s.Matrix4,B=!1,X=0;return{group:e,skyRoot:t,skyCamera:i,planet:I,solarSystem:T,bodies:T.bodies,galaxy:m,stars:x,meteors:U,layout:O,setPlanetVisible(k){T.group.visible=!!k},update(k,ne=!1,q,ee=0){if(B||!q?.isCamera)return;q.updateMatrixWorld(),q.getWorldQuaternion(n);let $=q.projectionMatrix.elements[5]/q.projectionMatrix.elements[0];if(!Number.isFinite($)||$<=0)return;i.quaternion.copy(n),i.aspect!==$&&(i.aspect=$,i.updateProjectionMatrix()),i.updateMatrixWorld(),r.uniforms.uSkyAspect.value=$,_.setFromMatrix4(D.makeRotationFromQuaternion(n)),O.anchored||(t.quaternion.copy(n),p.copy(f).invert().multiply(_.clone().invert()),T.anchor({aspect:$,tanHalfFov:c}),O.anchored=!0);let H=Number.isFinite(ee)?Math.max(0,ee):0;ne||(X+=H),A.uniforms.uTime.value=X,U.update(H,ne),e.visible=!0,e.updateMatrixWorld(!0),T.update(X,i),O.aspect=$,O.planetNdc=[...R.ndc],O.planetDirection=R.direction.toArray(),O.planetRadiusNdc=[...R.radiusNdc],O.planetVisible=T.group.visible&&R.visible},dispose(){if(!B){B=!0,U.dispose(),T.dispose();for(let k of[m.geometry,M])k.dispose();for(let k of[g,A])k.dispose();l.dispose(),e.removeFromParent(),e.clear()}}}}var Pw=`
  uniform sampler2D uNoise;
  float square(float value) { return value * value; }
  float noise2(vec2 p) {
    vec2 cell = floor(p), fraction = fract(p);
    fraction = fraction * fraction * (3.0 - 2.0 * fraction);
    vec2 uv = (cell + 0.5) / 128.0;
    float a = texture2D(uNoise, uv).r;
    float b = texture2D(uNoise, uv + vec2(1.0 / 128.0, 0.0)).r;
    float c = texture2D(uNoise, uv + vec2(0.0, 1.0 / 128.0)).r;
    float d = texture2D(uNoise, uv + vec2(1.0 / 128.0)).r;
    return mix(mix(a, b, fraction.x), mix(c, d, fraction.x), fraction.y);
  }
  float fbm(vec2 p) {
    float value = 0.0;
    value += noise2(p) * 0.55;
    value += noise2(p * 2.03 + 11.7) * 0.27;
    value += noise2(p * 4.11 + 27.1) * 0.12;
    value += noise2(p * 8.17 + 5.4) * 0.06;
    return value;
  }
`,Iw=`
  uniform float uAspect;
  uniform float uTanHalfFov;
  uniform mat3 uCameraToWorld;
  uniform mat3 uGalaxyFromWorld;
  varying vec2 vUv;
  ${Pw}
  void main() {
    vec2 screen = vUv * 2.0 - 1.0;
    vec3 ray = normalize(vec3(screen.x * uAspect * uTanHalfFov, screen.y * uTanHalfFov, -1.0));
    vec3 celestial = uGalaxyFromWorld * uCameraToWorld * ray;
    float along = atan(celestial.x, celestial.z);
    float crossBand = asin(clamp(celestial.y, -1.0, 1.0)) / uTanHalfFov;
    // Circular noise coordinates meet continuously at the longitude seam behind the observer.
    float broadNoise = fbm(vec2(sin(along) * 5.5 + crossBand * 7.0, cos(along) * 5.5 - crossBand * 3.0) + 18.3);
    float knots = fbm(vec2(sin(along) * 18.0 + crossBand * 23.0, cos(along) * 18.0 - crossBand * 11.0) + 41.7);
    float warp = (broadNoise - 0.5) * 0.13;
    float haze = exp(-square((crossBand + warp) / 0.26));
    float spine = exp(-square((crossBand + warp * 0.55) / 0.115));
    float clouds = haze * (0.25 + broadNoise * 0.75) + spine * knots * 0.45;
    float dustOffset = crossBand + 0.024 + (knots - 0.5) * 0.075;
    float dust = exp(-square(dustOffset / 0.036)) * (0.35 + broadNoise * 0.65);
    vec3 base = vec3(0.0025, 0.005, 0.009);
    vec3 blue = vec3(0.028, 0.039, 0.065);
    vec3 ivory = vec3(0.072, 0.061, 0.073);
    vec3 cloudColor = mix(blue, ivory, smoothstep(0.38, 0.72, knots));
    vec3 color = base + cloudColor * clouds * (1.0 - dust * 0.86);
    color += vec3(0.005, 0.004, 0.009) * haze * (1.0 - dust);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;function Dw(s){return()=>(s=s*1664525+1013904223>>>0,s/4294967296)}var Gu=class{constructor(e,t){this.THREE=e,this.group=new e.Group,this.group.name="mine_flame_jets",t.add(this.group),this.capacity=24,this.slots=Array.from({length:this.capacity},()=>({active:!1,age:0,seed:0})),this.activeCount=0,this.disposed=!1,this.serial=0,this.matrix=new e.Matrix4,this.origin=new e.Vector3,this.normal=new e.Vector3,this.up=new e.Vector3(0,1,0),this.rotation=new e.Quaternion,this.scaleVector=new e.Vector3;let i=new e.PlaneGeometry(1,1,4,12);i.translate(0,.5,0),this.fireParameters=new e.InstancedBufferAttribute(new Float32Array(this.capacity*4*4),4).setUsage(e.DynamicDrawUsage),this.fireDirections=new e.InstancedBufferAttribute(new Float32Array(this.capacity*4*3),3),i.setAttribute("jetParameters",this.fireParameters),i.setAttribute("jetDirection",this.fireDirections),this.fireMaterial=new e.ShaderMaterial({transparent:!0,depthWrite:!1,blending:e.AdditiveBlending,side:e.DoubleSide,toneMapped:!1,vertexShader:Lw,fragmentShader:Nw}),this.fire=new e.InstancedMesh(i,this.fireMaterial,this.capacity*4),this.fire.name="three_flame_tongues_and_ground_flare",this.fire.frustumCulled=!1,this.fire.instanceMatrix.setUsage(e.DynamicDrawUsage),this.group.add(this.fire);let n=new e.PlaneGeometry(1,1);this.smokeParameters=new e.InstancedBufferAttribute(new Float32Array(this.capacity*4*4),4).setUsage(e.DynamicDrawUsage),n.setAttribute("smokeParameters",this.smokeParameters),this.smokeMaterial=new e.ShaderMaterial({transparent:!0,depthWrite:!1,side:e.DoubleSide,toneMapped:!1,vertexShader:Uw,fragmentShader:Fw}),this.smoke=new e.InstancedMesh(n,this.smokeMaterial,this.capacity*4),this.smoke.name="short_bounded_smoke_tails",this.smoke.frustumCulled=!1,this.smoke.instanceMatrix.setUsage(e.DynamicDrawUsage),this.group.add(this.smoke),this.clear()}trigger({x:e,y:t=.48,z:i,normal:n=[0,1,0],scale:r=1}){if(this.disposed)return;if(![e,t,i].every(Number.isFinite))throw new TypeError("Flame coordinates must be finite");if(!Array.isArray(n)||n.length!==3||!n.every(Number.isFinite))throw new TypeError("Flame normal must contain three finite coordinates");if(!Number.isFinite(r)||r<=0)throw new RangeError("Flame scale must be positive and finite");if(this.normal.fromArray(n),this.normal.lengthSq()<1e-12)throw new RangeError("Flame normal must be nonzero");this.normal.normalize(),this.rotation.setFromUnitVectors(this.up,this.normal),this.scaleVector.setScalar(r);let a=this.slots.findIndex(c=>!c.active);a<0&&(a=this.slots.reduce((c,h,d)=>h.age>this.slots[c].age?d:c,0));let o=this.slots[a];o.active||this.activeCount++,o.active=!0,o.age=0,o.seed=++this.serial*1.6180339%17;let l=o.seed*2.39996;for(let c=0;c<4;c++){let h=a*4+c,d=c===0,u=c===3,f=l+(c===1?0:Math.PI+.55),p=d?1.9+Math.sin(o.seed)*.18:1.2+c*.09,_=d?.64:.43;this.fireParameters.setXYZW(h,0,u?-1:p,u?.92:_,o.seed+c*3.7),this.fireDirections.setXYZ(h,d||u?0:Math.cos(f)*.54,0,d||u?0:Math.sin(f)*.54),this.origin.set(e,t,i).addScaledVector(this.normal,u?-.1*r:0),this.matrix.compose(this.origin,this.rotation,this.scaleVector),this.fire.setMatrixAt(h,this.matrix),this.origin.set(e,t,i).addScaledVector(this.normal,.1*r),this.matrix.compose(this.origin,this.rotation,this.scaleVector),this.smoke.setMatrixAt(h,this.matrix),this.smokeParameters.setXYZW(h,0,c*.07+.08,o.seed+c*5.3,.56+c*.045)}this.fireDirections.needsUpdate=!0,this.fireParameters.needsUpdate=!0,this.smokeParameters.needsUpdate=!0,this.fire.instanceMatrix.needsUpdate=!0,this.smoke.instanceMatrix.needsUpdate=!0,this.group.visible=!0}update(e){if(this.disposed||!this.activeCount)return;let t=Number.isFinite(e)?Math.max(0,e):0;for(let i=0;i<this.capacity;i++){let n=this.slots[i];if(n.active){n.age+=t,n.age>=.98&&(n.active=!1,this.activeCount--);for(let r=0;r<4;r++){let a=i*4+r;this.fireParameters.setX(a,n.active?n.age:-1),this.smokeParameters.setX(a,n.active?n.age:-1)}}}this.fireParameters.needsUpdate=!0,this.smokeParameters.needsUpdate=!0,this.group.visible=this.activeCount>0}clear(){if(!this.disposed){for(let e=0;e<this.capacity;e++){this.slots[e].active=!1;for(let t=0;t<4;t++)this.fireParameters.setX(e*4+t,-1),this.smokeParameters.setX(e*4+t,-1)}this.activeCount=0,this.fireParameters.needsUpdate=!0,this.smokeParameters.needsUpdate=!0,this.group.visible=!1}}dispose(){if(!this.disposed){this.clear(),this.disposed=!0;for(let e of[this.fire,this.smoke])e.dispose(),e.geometry.dispose(),e.material.dispose();this.group.removeFromParent(),this.group.clear()}}},B0=`
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float turbulence(vec2 p) { return noise(p) * 0.59 + noise(p * 2.07 + 7.3) * 0.28 + noise(p * 4.13) * 0.13; }
`,Lw=`
  attribute vec4 jetParameters;
  attribute vec3 jetDirection;
  varying vec2 vUv;
  varying float vAge;
  varying float vSeed;
  varying float vGround;
  void main() {
    vUv = uv;
    vAge = jetParameters.x;
    vSeed = jetParameters.w;
    vGround = jetParameters.y < 0.0 ? 1.0 : 0.0;
    if (vAge < 0.0 || vAge > 0.74) { gl_Position = vec4(2, 2, 2, 1); return; }
    vec3 origin = (modelMatrix * instanceMatrix * vec4(0, 0, 0, 1)).xyz;
    mat3 basis = mat3(modelMatrix * instanceMatrix);
    float scale = length(basis[1]);
    vec3 axis = normalize(basis[1]);
    vec3 right = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
    vec3 lateral = right - axis * dot(right, axis);
    right = length(lateral) > 0.01 ? normalize(lateral) : normalize(basis[0]);
    vec3 world;
    if (vGround > 0.5) {
      float radius = jetParameters.z * (0.3 + min(vAge / 0.36, 1.0) * 0.75);
      world = origin + basis * vec3(position.x * radius, 0.012, (position.y - 0.5) * radius);
    } else {
      float rise = 0.65 + 0.35 * smoothstep(0.0, 0.15, vAge);
      float lift = max(0.0, vAge - 0.24) * 0.42;
      float bend = sin(uv.y * 5.7 - vAge * 16.0 + vSeed) * 0.065 * uv.y;
      world = origin + basis * vec3(0, uv.y * jetParameters.y * rise + lift, 0);
      world += right * (position.x * jetParameters.z + bend) * scale;
      world += basis * jetDirection * uv.y * uv.y;
    }
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`,Nw=`
  varying vec2 vUv;
  varying float vAge;
  varying float vSeed;
  varying float vGround;
  ${B0}
  void main() {
    if (vAge < 0.0 || vAge > 0.74) discard;
    float ageFade = smoothstep(-0.025, 0.035, vAge) * (1.0 - smoothstep(0.28, 0.74, vAge));
    float grain = turbulence(vec2(vUv.x * 6.0 + vSeed, vUv.y * 5.4 - vAge * 8.5));
    float density;
    float core;
    if (vGround > 0.5) {
      vec2 p = (vUv - 0.5) * 2.0;
      float radius = length(p);
      float rim = 1.0 - smoothstep(0.065, 0.2, abs(radius - 0.57 - (grain - 0.5) * 0.2));
      density = rim * (1.0 - smoothstep(0.32, 0.61, vAge));
      core = 0.0;
    } else {
      float level = vUv.y;
      float center = (vUv.x - 0.5) * 2.0;
      float outline = pow(max(0.0, sin(level * 3.14159)), 0.72) * (0.72 - level * 0.29);
      outline += 0.08 * (1.0 - level);
      float torn = outline - abs(center + (grain - 0.5) * (0.25 + level * 0.38));
      density = smoothstep(-0.04, 0.115, torn) * smoothstep(0.0, 0.07, level);
      density *= 1.0 - smoothstep(0.78 + (grain - 0.5) * 0.29, 1.0, level);
      density *= 0.65 + grain * 0.35;
      core = (1.0 - smoothstep(0.035, 0.16, abs(center))) * (1.0 - smoothstep(0.1, 0.44, level));
      core *= smoothstep(0.04, 0.14, level);
    }
    float alpha = density * ageFade;
    if (alpha < 0.015) discard;
    vec3 outer = mix(vec3(0.72, 0.025, 0.001), vec3(1.28, 0.19, 0.007), grain);
    vec3 color = mix(outer, vec3(1.55, 0.82, 0.065), core * 0.85);
    gl_FragColor = vec4(color, alpha * (vGround > 0.5 ? 0.72 : 0.87));
    #include <colorspace_fragment>
  }
`,Uw=`
  attribute vec4 smokeParameters;
  varying vec2 vUv;
  varying float vProgress;
  varying float vSeed;
  void main() {
    vUv = uv;
    vSeed = smokeParameters.z;
    vProgress = (smokeParameters.x - smokeParameters.y) / smokeParameters.w;
    if (smokeParameters.x < 0.0 || vProgress < 0.0 || vProgress > 1.0) { gl_Position = vec4(2, 2, 2, 1); return; }
    vec3 origin = (modelMatrix * instanceMatrix * vec4(0, 0, 0, 1)).xyz;
    mat3 basis = mat3(modelMatrix * instanceMatrix);
    float scale = length(basis[1]);
    vec3 right = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
    vec3 up = normalize(vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]));
    float size = 0.26 + vProgress * 0.63;
    vec3 drift = vec3(sin(vSeed) * 0.18, 0.52 + vProgress * 1.18, cos(vSeed) * 0.18);
    vec3 world = origin + basis * drift + (right * position.x + up * position.y) * size * scale;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`,Fw=`
  varying vec2 vUv;
  varying float vProgress;
  varying float vSeed;
  ${B0}
  void main() {
    if (vProgress < 0.0 || vProgress > 1.0) discard;
    vec2 p = (vUv - 0.5) * 2.0;
    float grain = turbulence(p * 3.0 + vec2(vSeed, -vProgress * 1.7));
    float alpha = (1.0 - smoothstep(0.25, 1.0, length(p) + (grain - 0.5) * 0.35));
    alpha *= smoothstep(0.0, 0.15, vProgress) * (1.0 - smoothstep(0.35, 1.0, vProgress)) * 0.24;
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(mix(vec3(0.025, 0.02, 0.018), vec3(0.085, 0.065, 0.05), grain), alpha);
    #include <colorspace_fragment>
  }
`;var Hu=class{constructor(e,t,{reducedMotion:i=()=>!1}={}){this.THREE=e,this.reducedMotion=i,this.disposed=!1,this.nextParticle=0,this.root=new e.Group,this.root.name="survey-effects",t.add(this.root),this.flames=new Gu(e,this.root),this.colors={reveal:new e.Color("#8aefff").multiplyScalar(1.5),chord:new e.Color("#71e8ff").multiplyScalar(1.65),flag:new e.Color("#ffbf69").multiplyScalar(1.75),lose:new e.Color("#ff632d").multiplyScalar(1.95),win:new e.Color("#69ffc1").multiplyScalar(1.8)},this.particles=Array.from({length:384},()=>({life:0,age:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,gravity:0,red:0,green:0,blue:0,size:0,trail:!1})),this.positions=new Float32Array(this.particles.length*3),this.particleColors=new Float32Array(this.particles.length*3),this.opacities=new Float32Array(this.particles.length),this.sizes=new Float32Array(this.particles.length);let n=new e.BufferGeometry;n.setAttribute("position",new e.BufferAttribute(this.positions,3).setUsage(e.DynamicDrawUsage)),n.setAttribute("color",new e.BufferAttribute(this.particleColors,3).setUsage(e.DynamicDrawUsage)),n.setAttribute("particleOpacity",new e.BufferAttribute(this.opacities,1).setUsage(e.DynamicDrawUsage)),n.setAttribute("particleSize",new e.BufferAttribute(this.sizes,1).setUsage(e.DynamicDrawUsage)),n.setDrawRange(0,0);let r=new e.ShaderMaterial({transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:e.AdditiveBlending,vertexShader:Ow,fragmentShader:Bw});this.points=new e.Points(n,r),this.points.frustumCulled=!1,this.points.visible=!1,this.root.add(this.points),this.trailPositions=new Float32Array(this.particles.length*6),this.trailColors=new Float32Array(this.particles.length*8);let a=new e.BufferGeometry;a.setAttribute("position",new e.BufferAttribute(this.trailPositions,3).setUsage(e.DynamicDrawUsage)),a.setAttribute("color",new e.BufferAttribute(this.trailColors,4).setUsage(e.DynamicDrawUsage)),a.setDrawRange(0,0),this.trails=new e.LineSegments(a,new e.LineBasicMaterial({vertexColors:!0,transparent:!0,depthWrite:!1,toneMapped:!1,blending:e.AdditiveBlending})),this.trails.frustumCulled=!1,this.trails.visible=!1,this.root.add(this.trails),this.ringGeometry=new e.RingGeometry(.965,1,72),this.columnGeometry=new e.CylinderGeometry(.045,.09,1,12,1,!0),this.shellGeometry=new e.SphereGeometry(1,32,20),this.rings=Array.from({length:6},()=>this.createMeshSlot("ring",this.ringGeometry)),this.columns=Array.from({length:2},()=>this.createMeshSlot("column",this.columnGeometry)),this.shells=Array.from({length:6},()=>this.createMeshSlot("shell",this.shellGeometry)),this.fireballs=Array.from({length:6},()=>this.createMeshSlot("fireball",this.shellGeometry)),this.meshSlots=[...this.rings,...this.columns,...this.shells,...this.fireballs]}trigger(e,t){if(this.disposed||this.reducedMotion()||!this.colors[e]||!Number.isFinite(t?.x)||!Number.isFinite(t?.z))return;let i={x:t.x,y:Number.isFinite(t.y)?t.y:.38,z:t.z},n=this.colors[e];e==="lose"?(this.flames.trigger(i),this.startMesh(this.fireballs,i,n,{life:.18,radius:.22,opacity:.65}),this.startMesh(this.shells,i,n,{life:.36,radius:1.1,opacity:.3}),this.startMesh(this.rings,i,n,{life:.55,radius:1.6,opacity:.5}),this.emitParticles(i,n,40,"debris")):e==="win"?(this.startMesh(this.rings,i,n,{life:1.45,radius:4.3,opacity:.68}),this.startMesh(this.shells,i,n,{life:1.2,radius:2.1,opacity:.22}),this.emitParticles(i,n,44,"celebrate")):e==="flag"?(this.startMesh(this.columns,i,n,{life:.65,radius:1.65,opacity:.6}),this.startMesh(this.rings,i,n,{life:.62,radius:.8,opacity:.58}),this.emitParticles(i,n,12,"beacon")):(this.startMesh(this.rings,i,n,{life:.72,radius:e==="chord"?1.8:1.25,opacity:.62}),this.emitParticles(i,n,10,"scan")),this.writeParticles()}update(e,t){if(this.disposed)return;if(this.reducedMotion()){(this.points.visible||this.flames.activeCount||this.meshSlots.some(a=>a.active))&&this.clear();return}let i=Number.isFinite(e)?Math.max(e,0):0,n=Math.min(i,.1);this.flames.update(i);let r=Math.exp(-n*.65);for(let a of this.particles)if(!(a.life<=0)){if(a.age+=i,a.age>=a.life){a.life=0;continue}a.vx*=r,a.vz*=r,a.vy-=a.gravity*n,a.x+=a.vx*n,a.y+=a.vy*n,a.z+=a.vz*n}for(let a of this.meshSlots)if(a.active){if(a.age+=i,a.age>=a.life){a.active=!1,a.mesh.visible=!1;continue}this.updateMesh(a)}this.points.visible&&this.writeParticles()}clear(){if(!this.disposed){for(let e of this.particles)e.life=0;for(let e of this.meshSlots)e.active=!1,e.mesh.visible=!1;this.points.geometry.setDrawRange(0,0),this.points.visible=!1,this.nextParticle=0,this.flames.clear(),this.trails.geometry.setDrawRange(0,0),this.trails.visible=!1}}dispose(){if(!this.disposed){this.clear(),this.disposed=!0,this.root.removeFromParent(),this.points.geometry.dispose(),this.points.material.dispose(),this.flames.dispose(),this.trails.geometry.dispose(),this.trails.material.dispose(),this.ringGeometry.dispose(),this.columnGeometry.dispose(),this.shellGeometry.dispose();for(let e of this.meshSlots)e.mesh.material.dispose();this.root.clear()}}createMeshSlot(e,t){let i=this.THREE,n=e==="shell"||e==="fireball"?new i.ShaderMaterial({uniforms:{effectColor:{value:new i.Color},effectOpacity:{value:0},effectAge:{value:0}},vertexShader:e==="fireball"?Vw:zw,fragmentShader:e==="fireball"?Gw:kw,transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:e==="fireball"?i.NormalBlending:i.AdditiveBlending,side:i.FrontSide}):new i.MeshBasicMaterial({color:16777215,transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:i.AdditiveBlending,side:i.DoubleSide}),r=new i.Mesh(t,n);return r.visible=!1,e==="ring"&&(r.rotation.x=-Math.PI/2),this.root.add(r),{kind:e,mesh:r,active:!1,age:0,life:0,radius:0,opacity:0,baseY:0}}startMesh(e,t,i,n){let r=e.find(a=>!a.active)||e.reduce((a,o)=>o.age>a.age?o:a);Object.assign(r,n,{active:!0,age:0,baseY:t.y}),r.mesh.position.set(t.x,t.y,t.z),r.mesh.visible=!0,r.kind==="shell"||r.kind==="fireball"?r.mesh.material.uniforms.effectColor.value.copy(i):r.mesh.material.color.copy(i),this.updateMesh(r)}updateMesh(e){let t=e.age/e.life,i=1-(1-t)**2.5,n=e.opacity*(1-t)**1.35;if(e.kind==="column"){let r=.2+e.radius*Math.sin(Math.PI*t);e.mesh.scale.set(1-t*.55,r,1-t*.55),e.mesh.position.y=e.baseY+r/2,e.mesh.material.opacity=n}else if(e.kind==="fireball"){let r=.13+e.radius*(1-Math.exp(-t*9));e.mesh.scale.set(r,r*(1+t*.65),r),e.mesh.position.y=e.baseY+t*.75,e.mesh.material.uniforms.effectAge.value=t,e.mesh.material.uniforms.effectOpacity.value=e.opacity*(1-t**1.7)}else e.mesh.scale.setScalar(.12+e.radius*i),e.kind==="shell"?e.mesh.material.uniforms.effectOpacity.value=n:e.mesh.material.opacity=n}emitParticles(e,t,i,n){for(let r=0;r<i;r+=1){let a=this.particles[this.nextParticle];this.nextParticle=(this.nextParticle+1)%this.particles.length;let o=Math.random()*Math.PI*2,l=n==="debris"?.8+Math.random()*2.2:n==="celebrate"?.7+Math.random()*1.1:.12+Math.random()*.5,c=n==="beacon"?.1:Math.random()*.22;a.life=n==="debris"?.55+Math.random()*.35:n==="celebrate"?1.15+Math.random()*.45:.55+Math.random()*.35,a.age=0,a.x=e.x+Math.cos(o)*c,a.y=e.y+.04,a.z=e.z+Math.sin(o)*c,a.vx=Math.cos(o)*l,a.vz=Math.sin(o)*l,a.vy=n==="debris"?2.4+Math.random()*5.2:n==="celebrate"?2+Math.random()*2.1:.7+Math.random()*1.4,a.gravity=n==="debris"?8:n==="celebrate"?1.7:.45,a.trail=n==="debris",a.red=t.r,a.green=t.g,a.blue=t.b,a.size=n==="debris"?1.5+Math.random()*2:2+Math.random()*2.8}this.points.visible=!0}writeParticles(){let e=0,t=0;for(let i of this.particles){if(i.life<=0)continue;let n=e*3;if(this.positions[n]=i.x,this.positions[n+1]=i.y,this.positions[n+2]=i.z,this.particleColors[n]=i.red,this.particleColors[n+1]=i.green,this.particleColors[n+2]=i.blue,this.opacities[e]=Math.pow(1-i.age/i.life,1.45),this.sizes[e]=i.size,i.trail){let r=t*6,a=t*8,o=.035+i.age*.04;this.trailPositions.set([i.x,i.y,i.z,i.x-i.vx*o,i.y-i.vy*o,i.z-i.vz*o],r);let l=this.opacities[e];this.trailColors.set([i.red*1.15,i.green*1.6,i.blue,l*.9,i.red*.65,i.green*.25,0,0],a),t++}e+=1}if(this.points.geometry.setDrawRange(0,e),this.points.visible=e>0,this.trails.visible=t>0,this.trails.geometry.setDrawRange(0,t*2),t)for(let i of Object.values(this.trails.geometry.attributes))i.needsUpdate=!0;if(e)for(let i of Object.values(this.points.geometry.attributes))i.needsUpdate=!0}},Ow=`
  attribute vec3 color;
  attribute float particleOpacity;
  attribute float particleSize;
  varying vec3 effectColor;
  varying float effectOpacity;
  void main() {
    effectColor = color;
    effectOpacity = particleOpacity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = particleSize;
  }
`,Bw=`
  varying vec3 effectColor;
  varying float effectOpacity;
  void main() {
    vec2 p = abs(gl_PointCoord - vec2(0.5)) * 2.0;
    float shape = 1.0 - smoothstep(0.4, 1.0, p.x + p.y);
    float alpha = shape * effectOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(effectColor, alpha);
  }
`,zw=`
  varying vec3 effectNormal;
  varying vec3 effectView;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    effectNormal = normalize(normalMatrix * normal);
    effectView = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`,kw=`
  uniform vec3 effectColor;
  uniform float effectOpacity;
  varying vec3 effectNormal;
  varying vec3 effectView;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(effectNormal), normalize(effectView))), 7.0);
    float alpha = rim * effectOpacity;
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(effectColor, alpha);
  }
`,Vw=`
  uniform float effectAge;
  varying vec3 firePosition;
  varying vec3 fireNormal;
  varying vec3 fireView;
  void main() {
    firePosition = position;
    float turbulence = sin(position.x * 12.0 + effectAge * 9.0) *
      sin(position.y * 9.0 - effectAge * 7.0) * sin(position.z * 11.0);
    vec4 viewPosition = modelViewMatrix * vec4(position * (0.93 + turbulence * 0.09), 1.0);
    fireNormal = normalize(normalMatrix * normal);
    fireView = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`,Gw=`
  uniform float effectAge;
  uniform float effectOpacity;
  varying vec3 firePosition;
  varying vec3 fireNormal;
  varying vec3 fireView;
  void main() {
    vec3 p = firePosition * 8.0;
    float turbulence = 0.5 + 0.5 * sin(p.x + sin(p.y * 1.4 + effectAge * 8.0)) *
      sin(p.z * 1.3 - p.y + effectAge * 11.0);
    float facing = abs(dot(normalize(fireNormal), normalize(fireView)));
    float heat = clamp(1.25 - effectAge * 1.65 + turbulence * 0.26 + facing * 0.18, 0.0, 1.0);
    vec3 smoke = vec3(0.035, 0.022, 0.019) * (0.7 + turbulence * 1.3);
    vec3 ember = vec3(1.7, 0.08, 0.008);
    vec3 flame = vec3(3.2, 0.9, 0.08);
    vec3 core = vec3(4.0, 2.5, 0.95);
    vec3 color = mix(smoke, ember, smoothstep(0.2, 0.5, heat));
    color = mix(color, flame, smoothstep(0.55, 0.82, heat));
    color = mix(color, core, smoothstep(0.83, 1.0, heat));
    float alpha = effectOpacity * smoothstep(0.0, 0.36, facing) * (0.72 + turbulence * 0.28);
    gl_FragColor = vec4(color, alpha);
  }
`;var Ga=class{constructor(e,t){if(!Number.isInteger(t)||t<1)throw new RangeError("Mine capacity must be a positive integer");this.THREE=e,this.capacity=t,this.group=new e.Group,this.group.name="mechanical_mines",this.dummy=new e.Object3D,this.direction=new e.Vector3,this.up=new e.Vector3(0,1,0),this.color=new e.Color,this.itemTransform=new e.Matrix4,this.itemTranslation=new e.Matrix4,this.outputMatrix=new e.Matrix4,this.itemOrigin=new e.Vector3,this.itemNormal=new e.Vector3,this.itemScale=new e.Vector3,this.itemRotation=new e.Quaternion,this.disposed=!1;let i=new e.MeshStandardMaterial({color:"#39434a",metalness:.82,roughness:.36,side:e.DoubleSide}),n=new e.MeshStandardMaterial({color:"#6e777b",metalness:.9,roughness:.3}),r=new e.MeshStandardMaterial({color:"#c0a58b",metalness:.88,roughness:.29}),a=new e.MeshBasicMaterial({color:16777215}),o=new e.MeshStandardMaterial({color:"#14191c",metalness:.35,roughness:.93});this.parts={armorPetals:this.createInstances("mine_armor_petals",new e.SphereGeometry(.255,12,12,.085,Math.PI/2-.17,.24,Math.PI-.48),i,t*4),reactorCores:this.createInstances("mine_reactor_cores_and_fuse_lights",new e.SphereGeometry(.19,14,10),a,t*2),equatorSeams:this.createInstances("mine_equator_and_residual_heat",new e.TorusGeometry(.257,.012,5,32),a,t),sensorCollars:this.createInstances("mine_sensor_collars",new e.CylinderGeometry(.039,.052,.064,8),n,t*6),sensorTips:this.createInstances("mine_short_contact_sensors",new e.ConeGeometry(.04,.095,8),r,t*6),fuseHousings:this.createInstances("mine_top_fuse_housings",new e.CylinderGeometry(.071,.092,.1,10),n,t),spentBases:this.createInstances("mine_spent_bases",new e.CylinderGeometry(.265,.3,.065,10),o,t),spentFragments:this.createInstances("mine_broken_armor_fragments",new e.IcosahedronGeometry(.115,0),o,t*4)}}update(e){if(this.disposed)return;if(!Array.isArray(e))throw new TypeError("Mine items must be an array");if(e.length>this.capacity)throw new RangeError("Mine items exceed capacity");let t=Object.fromEntries(Object.keys(this.parts).map(i=>[i,0]));for(let i of e){let{x:n,z:r,y:a=.35,stage:o="armed"}=i;if(![n,a,r].every(Number.isFinite))throw new TypeError("Mine coordinates must be finite");if(!["armed","primed","spent"].includes(o))throw new RangeError("Unknown mine stage");let l=i.normal??[0,1,0],c=i.scale??1;if(!Array.isArray(l)||l.length!==3||!l.every(Number.isFinite))throw new TypeError("Mine normal must contain three finite coordinates");if(!Number.isFinite(c)||c<=0)throw new RangeError("Mine scale must be positive and finite");if(this.itemNormal.fromArray(l),this.itemNormal.lengthSq()<1e-12)throw new RangeError("Mine normal must be nonzero");this.itemRotation.setFromUnitVectors(this.up,this.itemNormal.normalize()),this.itemOrigin.set(n,a,r),this.itemScale.setScalar(c),this.itemTransform.compose(this.itemOrigin,this.itemRotation,this.itemScale),this.itemTransform.multiply(this.itemTranslation.makeTranslation(-n,-a,-r));let h=Number.isFinite(i.progress)?Math.max(0,Math.min(1,i.progress)):0,d=o==="primed",u=d?.5+Math.sin(h*Math.PI*5)*.5:0,f=d?1+h*.05+u*.012:1;if(o==="spent"){let _=a-.225;this.place(this.parts.spentBases,t.spentBases++,n,_,r),this.dummy.rotation.set(-Math.PI/2,0,0),this.place(this.parts.equatorSeams,t.equatorSeams,n,_+.038,r,.84,.84,.42,!0),this.parts.equatorSeams.setColorAt(t.equatorSeams++,this.color.setRGB(.38*(1-h*.7),.018,.004));for(let g=0;g<4;g++){let m=g*Math.PI/2+.31,y=.14+g%2*.045;this.dummy.rotation.set(.12*g,m,.19*(g-1.5)),this.place(this.parts.spentFragments,t.spentFragments++,n+Math.cos(m)*y,_+.043,r+Math.sin(m)*y,1.05,.34,.78,!0)}continue}for(let _=0;_<4;_++)this.dummy.rotation.set(0,_*Math.PI/2,0),this.place(this.parts.armorPetals,t.armorPetals++,n,a,r,f,f,f,!0);let p=d?2.4+h*1.9+u*.8:1.4;this.color.setRGB(p,p*(d?.035:.085),.012),this.place(this.parts.reactorCores,t.reactorCores,n,a,r,f,f,f),this.parts.reactorCores.setColorAt(t.reactorCores++,this.color),this.place(this.parts.fuseHousings,t.fuseHousings++,n,a+.257*f,r),this.place(this.parts.reactorCores,t.reactorCores,n,a+.312*f,r,.28,.055,.28),this.parts.reactorCores.setColorAt(t.reactorCores++,this.color),this.dummy.rotation.set(-Math.PI/2,0,0),this.place(this.parts.equatorSeams,t.equatorSeams,n,a,r,f,f,f,!0),this.parts.equatorSeams.setColorAt(t.equatorSeams++,this.color.setRGB(p*.8,p*(d?.03:.075),.005));for(let _=0;_<6;_++){let g=_*Math.PI/3+Math.PI/6;this.direction.set(Math.cos(g),.07,Math.sin(g)).normalize(),this.dummy.quaternion.setFromUnitVectors(this.up,this.direction);let m=.249*f;this.place(this.parts.sensorCollars,t.sensorCollars++,n+this.direction.x*m,a+this.direction.y*m,r+this.direction.z*m,1,1,1,!0),this.dummy.quaternion.setFromUnitVectors(this.up,this.direction);let y=.3*f;this.place(this.parts.sensorTips,t.sensorTips++,n+this.direction.x*y,a+this.direction.y*y,r+this.direction.z*y,1,1,1,!0)}}for(let[i,n]of Object.entries(this.parts))n.count=t[i],n.instanceMatrix.needsUpdate=!0,n.instanceColor&&(n.instanceColor.needsUpdate=!0),n.computeBoundingSphere()}dispose(){if(this.disposed)return;this.disposed=!0;let e=new Set;for(let t of Object.values(this.parts))t.dispose(),t.geometry.dispose(),e.add(t.material);for(let t of e)t.dispose();this.group.removeFromParent(),this.group.clear()}createInstances(e,t,i,n){let r=new this.THREE.InstancedMesh(t,i,n);return r.name=e,r.count=0,r.instanceMatrix.setUsage(this.THREE.DynamicDrawUsage),this.group.add(r),r}place(e,t,i,n,r,a=1,o=1,l=1,c=!1){this.dummy.position.set(i,n,r),c||this.dummy.rotation.set(0,0,0),this.dummy.scale.set(a,o,l),this.dummy.updateMatrix(),this.outputMatrix.multiplyMatrices(this.itemTransform,this.dummy.matrix),e.setMatrixAt(t,this.outputMatrix)}};var Wu=class{constructor(){this.reset()}reset(){this.time=0,this.entries=[],this.byId=new Map,this.active=!1,this.completed=!1,this.duration=0}start(e){if(this.reset(),e.status!=="lost")return;let t=e.cells.filter(l=>l.revealed&&l.mine),i=t.find(l=>l.exploded)||t[0];if(!i)return;t.sort((l,c)=>l.id===i.id?-1:c.id===i.id?1:Math.hypot(l.x-i.x,l.y-i.y)-Math.hypot(c.x-i.x,c.y-i.y)||l.id-c.id);let n=Math.min(3,t.length),r=t.length-n,a=.12+(n-1)*.28,o=Math.min(2.03,r*.14);this.entries=t.map((l,c)=>{let h=r>0?(c-n+1)/r:0,d=c<n?.12+c*.28:a+.12+o*(1-(1-h)**1.9);return{id:l.id,x:l.x,y:l.y,index:c,blastAt:d,revealAt:Math.max(0,d-.42),fired:!1,revealed:c===0}}),this.byId=new Map(this.entries.map(l=>[l.id,l])),this.duration=this.entries.at(-1).blastAt+1.1,this.active=!0}advance(e){if(!this.active)return{revealed:[],explosions:[],finished:!1};this.time+=Math.max(0,Number.isFinite(e)?e:0);let t=[],i=[];for(let r of this.entries)!r.revealed&&this.time>=r.revealAt&&(r.revealed=!0,t.push(r.id)),!r.fired&&this.time>=r.blastAt&&(r.fired=!0,i.push({...r,total:this.entries.length}));let n=this.time>=this.duration;return n&&(this.active=!1,this.completed=!0),{revealed:t,explosions:i,finished:n}}stage(e){let t=this.byId.get(e);if(!t)return{stage:"armed",progress:0};if(this.time<t.revealAt)return{stage:"hidden",progress:0};if(this.time>=t.blastAt)return{stage:"spent",progress:Math.min(1,(this.time-t.blastAt)/.7)};let i=1-Math.min(1,(t.blastAt-this.time)/.42);return{stage:i<.35?"armed":"primed",progress:i}}present(e){return!this.entries.length||e.status!=="lost"?e:{...e,cells:e.cells.map(t=>this.byId.has(t.id)&&this.stage(t.id).stage==="hidden"?{...t,revealed:!1,mine:null,adjacent:null,exploded:!1}:t)}}};var Xu=class{constructor(e,t,{reducedMotion:i=()=>!1,onLaunch:n=()=>{},onBurst:r=()=>{}}={}){this.reducedMotion=i,this.onLaunch=n,this.onBurst=r,this.active=!1,this.activeCount=0,this.launchCount=0,this.burstCount=0,this.disposed=!1,this.elapsed=0,this.nextLaunch=0,this.nextParticle=0,this.duration=5.4,this.root=new e.Group,this.root.name="victory-fireworks",t.add(this.root),this.palette=[new e.Color("#66eaff").multiplyScalar(1.65),new e.Color("#ffd782").multiplyScalar(1.8),new e.Color("#b692ff").multiplyScalar(1.75)],this.gold=this.palette[1],this.particles=Array.from({length:wn},()=>({life:0,age:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,gravity:0,drag:0,red:0,green:0,blue:0,size:0,kind:0,twinkle:0})),this.rockets=Array.from({length:z0.length},()=>({active:!1,core:null,age:0,trailClock:0,originX:0,originZ:0,targetX:0,targetY:0,targetZ:0,flight:0,radius:0,colorIndex:0,pan:0,finale:!1})),this.positions=new Float32Array(wn*3),this.colors=new Float32Array(wn*3),this.opacities=new Float32Array(wn),this.sizes=new Float32Array(wn);let a=new e.BufferGeometry;for(let[l,c,h]of[["position",this.positions,3],["color",this.colors,3],["particleOpacity",this.opacities,1],["particleSize",this.sizes,1]])a.setAttribute(l,new e.BufferAttribute(c,h).setUsage(e.DynamicDrawUsage));a.setDrawRange(0,0),this.points=new e.Points(a,new e.ShaderMaterial({transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:e.AdditiveBlending,uniforms:{pixelRatio:{value:Math.min(2,globalThis.devicePixelRatio||1)}},vertexShader:Xw,fragmentShader:qw})),this.points.name="victory-firework-particles",this.points.frustumCulled=!1,this.points.visible=!1,this.root.add(this.points),this.trailPositions=new Float32Array(wn*6),this.trailColors=new Float32Array(wn*8);let o=new e.BufferGeometry;o.setAttribute("position",new e.BufferAttribute(this.trailPositions,3).setUsage(e.DynamicDrawUsage)),o.setAttribute("color",new e.BufferAttribute(this.trailColors,4).setUsage(e.DynamicDrawUsage)),o.setDrawRange(0,0),this.trails=new e.LineSegments(o,new e.LineBasicMaterial({vertexColors:!0,transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:e.AdditiveBlending})),this.trails.name="victory-firework-streaks",this.trails.frustumCulled=!1,this.trails.visible=!1,this.root.add(this.trails)}start({width:e=9,height:t=9}={}){if(this.disposed||(this.clear(),this.reducedMotion()))return;let i=Number.isFinite(e)?Math.max(5,Math.min(50,e)):9,n=Number.isFinite(t)?Math.max(5,Math.min(30,t)):9,r=(i-1)*1.06/2,a=(n-1)*1.06/2,o=Math.max(.8,Math.min(2.25,Math.min(i,n)/9));for(let l=0;l<this.rockets.length;l+=1){let c=this.rockets[l],[h,d,u]=Ww[l];c.originX=h*r*.91,c.originZ=d*a*.83,c.targetX=h*r*.67,c.targetZ=d*a*.6,c.targetY=(2.9+u*.85)*o,c.flight=.68+u*.12,c.radius=(1.4+u*.28)*o,c.colorIndex=l%this.palette.length,c.pan=Math.max(-1,Math.min(1,h*.8)),c.finale=l>=6}this.active=!0,this.launch(this.rockets[this.nextLaunch++]),this.syncBuffers()}update(e){if(this.disposed||!this.active)return;if(this.reducedMotion()){this.clear();return}if(!Number.isFinite(e)||e<=0)return;let t=Math.min(this.duration,this.elapsed+e);for(;this.elapsed<t;)this.advance(Math.min(t-this.elapsed,.08));this.syncBuffers(),(this.elapsed>=this.duration||this.nextLaunch===this.rockets.length&&this.activeCount===0)&&this.finish()}advance(e){this.elapsed+=e;for(let t of this.particles){if(t.life<=0||t.kind===2)continue;if(t.age+=e,t.age>=t.life){t.life=0;continue}let i=Math.exp(-t.drag*e);t.vx*=i,t.vz*=i,t.vy=t.vy*i-t.gravity*e,t.x+=t.vx*e,t.y+=t.vy*e,t.z+=t.vz*e}for(let t of this.rockets){if(!t.active)continue;t.age+=e;let i=Math.min(1,t.age/t.flight),n=t.core,r=Math.sin(i*Math.PI/2);n.x=t.originX+(t.targetX-t.originX)*i,n.y=.48+(t.targetY-.48)*r,n.z=t.originZ+(t.targetZ-t.originZ)*i,n.vx=(t.targetX-t.originX)/t.flight,n.vy=(t.targetY-.48)*Math.PI*Math.cos(i*Math.PI/2)/(2*t.flight),n.vz=(t.targetZ-t.originZ)/t.flight,t.trailClock+=e;let a=Math.min(4,Math.floor(t.trailClock/.022));t.trailClock%=.022;for(let o=0;o<a;o+=1){let l=this.allocate();if(!l)break;this.paint(l,this.gold,2.1+Math.random()*1.3);let c=Math.random()*e;l.x=n.x-n.vx*c,l.y=n.y-n.vy*c,l.z=n.z-n.vz*c,l.vx=(Math.random()-.5)*.22,l.vy=-.35-Math.random()*.45,l.vz=(Math.random()-.5)*.22,l.gravity=1.05,l.drag=.45,l.life=.22+Math.random()*.2}i===1&&this.burst(t)}this.nextLaunch<this.rockets.length&&this.elapsed>=z0[this.nextLaunch]&&this.launch(this.rockets[this.nextLaunch++])}clear(){this.finish(),this.elapsed=0,this.nextLaunch=0,this.nextParticle=0,this.launchCount=0,this.burstCount=0}dispose(){this.disposed||(this.clear(),this.disposed=!0,this.root.removeFromParent(),this.points.geometry.dispose(),this.points.material.dispose(),this.trails.geometry.dispose(),this.trails.material.dispose(),this.root.clear(),this.onLaunch=()=>{},this.onBurst=()=>{})}launch(e){let t=this.allocate();t&&(this.paint(t,this.gold,6.5),t.kind=2,t.life=1,t.x=e.originX,t.y=.48,t.z=e.originZ,t.vy=4,e.core=t,e.active=!0,e.age=0,e.trailClock=0,this.launchCount+=1,this.onLaunch({strength:e.finale?.48:.58,pan:e.pan}))}burst(e){e.active=!1,e.core.life=0,e.core=null;let t=e.finale?88:96,i=this.palette[e.colorIndex],n=Math.random()*Math.PI*2;for(let r=0;r<t;r+=1){let a=this.allocate();if(!a)break;let o=1-2*(r+.5)/t,l=Math.sqrt(1-o*o),c=r*Hw+n,h=r%5===0,d=e.radius*(h?1.2:2.05+Math.random()*.3);this.paint(a,r%9===0?this.gold:i,h?2.5:3.1+Math.random()*1.4),a.kind=1,a.x=e.targetX,a.y=e.targetY,a.z=e.targetZ,a.vx=Math.cos(c)*l*d,a.vy=o*d+e.radius*.28,a.vz=Math.sin(c)*l*d,a.gravity=1.05*Math.sqrt(e.radius),a.drag=1.2,a.life=1.08+Math.random()*.46,a.twinkle=r%7===0?1:0}this.burstCount+=1,this.onBurst({strength:e.finale?.7:.86,pan:e.pan})}allocate(){for(let e=0;e<wn;e+=1){let t=(this.nextParticle+e)%wn,i=this.particles[t];if(!(i.life>0))return this.nextParticle=(t+1)%wn,i.age=0,i.vx=0,i.vy=0,i.vz=0,i.gravity=0,i.drag=0,i.kind=0,i.twinkle=0,i}return null}paint(e,t,i){e.red=t.r,e.green=t.g,e.blue=t.b,e.size=i}syncBuffers(){let e=0,t=0;for(let i of this.particles){if(i.life<=0)continue;let n=1-i.age/i.life,r=i.kind===2?1:Math.pow(n,1.15),a=i.twinkle?.82+.18*Math.sin(i.age*26+i.x*3):1,o=r*a,l=e*3;this.positions[l]=i.x,this.positions[l+1]=i.y,this.positions[l+2]=i.z,this.colors[l]=i.red,this.colors[l+1]=i.green,this.colors[l+2]=i.blue,this.opacities[e]=o,this.sizes[e]=i.size*(.7+n*.3),e+=1;let c=i.kind===2?.12:.1+n*.075,h=t*6;this.trailPositions[h]=i.x,this.trailPositions[h+1]=i.y,this.trailPositions[h+2]=i.z,this.trailPositions[h+3]=i.x-i.vx*c,this.trailPositions[h+4]=i.y-i.vy*c,this.trailPositions[h+5]=i.z-i.vz*c;let d=t*8;this.trailColors[d]=i.red,this.trailColors[d+1]=i.green,this.trailColors[d+2]=i.blue,this.trailColors[d+3]=o*.68,this.trailColors[d+4]=i.red,this.trailColors[d+5]=i.green,this.trailColors[d+6]=i.blue,this.trailColors[d+7]=0,t+=1}this.activeCount=e,this.points.visible=e>0,this.trails.visible=t>0,this.points.geometry.setDrawRange(0,e),this.trails.geometry.setDrawRange(0,t*2);for(let i of Object.values(this.points.geometry.attributes))i.needsUpdate=!0;for(let i of Object.values(this.trails.geometry.attributes))i.needsUpdate=!0}finish(){this.active=!1,this.activeCount=0;for(let e of this.particles)e.life=0;for(let e of this.rockets)e.active=!1,e.core=null;this.points.visible=!1,this.trails.visible=!1,this.points.geometry.setDrawRange(0,0),this.trails.geometry.setDrawRange(0,0)}},wn=960,Hw=Math.PI*(3-Math.sqrt(5)),z0=[0,.4,.84,1.29,1.75,2.19,2.84,2.94,3.04],Ww=[[-1,.4,.5],[1,-.28,.85],[-.64,-1,.25],[.75,1,.65],[-1,-.22,1],[1,.65,.35],[-.74,.8,.6],[.04,-.85,.95],[.76,.42,.5]],Xw=`
  attribute vec3 color;
  attribute float particleOpacity;
  attribute float particleSize;
  uniform float pixelRatio;
  varying vec3 sparkColor;
  varying float sparkOpacity;
  void main() {
    sparkColor = color;
    sparkOpacity = particleOpacity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = particleSize * pixelRatio;
  }
`,qw=`
  varying vec3 sparkColor;
  varying float sparkOpacity;
  void main() {
    float radius = length(gl_PointCoord - vec2(0.5)) * 2.0;
    float halo = 1.0 - smoothstep(0.12, 1.0, radius);
    float core = 1.0 - smoothstep(0.0, 0.38, radius);
    float alpha = (halo * 0.72 + core * 0.28) * sparkOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(sparkColor, alpha);
  }
`;var cr={closed:new ae("#b87b51"),open:new ae("#6b4734"),hover:new ae("#cd986a"),openHover:new ae("#805b43"),flagged:new ae("#28434a"),flaggedHover:new ae("#36555b"),danger:new ae("#95483a")},Ha=class{constructor(e,{onReveal:t,onFlag:i,onChord:n,onHover:r,onFailure:a,onExplosion:o,onFirework:l,onFireworksStop:c,onChainComplete:h}){this.container=e,this.callbacks={onReveal:t,onFlag:i,onChord:n,onHover:r,onFailure:a,onExplosion:o,onFirework:l,onFireworksStop:c,onChainComplete:h},this.detonation=new Wu,this.reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)"),this.renderer=new dc({antialias:!0,alpha:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75)),this.renderer.setClearColor(0,0),this.renderer.outputColorSpace=zt,this.renderer.toneMapping=us,this.renderer.toneMappingExposure=1.35,this.renderer.domElement.setAttribute("aria-hidden","true"),e.appendChild(this.renderer.domElement),this.scene=new Bs,this.scene.background=new ae("#030810"),this.camera=new Gi(-9,9,9,-9,.1,240),this.camera.position.set(13,18,19),this.composer=new Bu(this.renderer),this.composer.addPass(new zu(this.scene,this.camera)),this.bloom=new ka(new Z(800,600),.75,.65,.85),this.composer.addPass(this.bloom),this.composer.addPass(new ku),this.controls=this.createControls(),this.pointer=new Z,this.raycaster=new pa,this.dummy=new ct,this.hoverId=-1,this.focusId=-1,this.mode="reveal",this.topView=!1,this.pointerState=null,this.pointers=new Set,this.board=new Ei,this.scene.add(this.board),this.labelMeshes=[],this.motions=[],this.textures=[],this.lastTime=0,this.setupLighting(),this.cosmos=O0(fs),this.scene.add(this.cosmos.group),this.effects=new Hu(fs,this.scene,{reducedMotion:()=>this.reducedMotion.matches}),this.fireworks=new Xu(fs,this.scene,{reducedMotion:()=>this.reducedMotion.matches,onLaunch:d=>this.callbacks.onFirework?.("launch",d),onBurst:d=>this.callbacks.onFirework?.("burst",d)}),this.bindEvents(),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(e),this.onVisibility=()=>{cancelAnimationFrame(this.frame),this.frame=null,document.hidden&&(this.controls.cancel?.(),this.cancelPointerInput()),document.hidden||(this.lastTime=performance.now(),this.frame=requestAnimationFrame(d=>this.animate(d)))},document.addEventListener("visibilitychange",this.onVisibility),this.frame=requestAnimationFrame(d=>this.animate(d))}createControls(){let e=new Uu(this.camera,this.renderer.domElement);return e.enableDamping=!0,e.dampingFactor=.1,e.enablePan=!0,e.minPolarAngle=.05,e.maxPolarAngle=Math.PI*.36,e.minZoom=.65,e.maxZoom=5,e.mouseButtons={LEFT:Hi.ROTATE,MIDDLE:Hi.PAN,RIGHT:null},e.touches={ONE:Wi.ROTATE,TWO:Wi.DOLLY_PAN},e.rotateSpeed=.55,e.zoomSpeed=.8,e}rebuild(e){this.detonation.reset(),this.fireworks.clear(),this.callbacks.onFireworksStop?.(),this.mines?.dispose(),this.effects.clear(),this.disposeGroup(this.board),this.textures.forEach(a=>a.dispose()),this.textures=[],this.board.clear(),this.snapshot=e,this.width=e.width,this.height=e.height,this.count=this.width*this.height,this.hoverId=-1,this.focusId=-1,this.motions=new Float32Array(this.count).fill(1);let t=k0(.93,.27,.055),i=new Ht({color:16777215,metalness:.24,roughness:.55});this.tiles=new Nt(t,i,this.count),this.tiles.instanceMatrix.setUsage(ds),this.board.add(this.tiles);let n=k0(1.005,.13,.025);this.tileBases=new Nt(n,new Ht({color:"#352d27",metalness:.65,roughness:.6}),this.count),this.board.add(this.tileBases);let r=Jw();this.textures.push(r),this.slits=new Nt(new Ri(.79,.79),new dt({map:r,color:"#684733",transparent:!0,opacity:.6,depthWrite:!1}),this.count),this.board.add(this.slits),this.innerLights=new Nt(new as(.11,.135,24),new dt({color:"#d8ba87",side:mi}),this.count),this.board.add(this.innerLights),this.colliders=new Nt(new jt(1.01,.45,1.01),new dt({visible:!1}),this.count),this.board.add(this.colliders);for(let a=0;a<this.count;a++){let o=this.position(a);this.setInstance(this.tileBases,a,o.x,-.1,o.z),this.setInstance(this.colliders,a,o.x,.18,o.z)}this.tileBases.instanceMatrix.needsUpdate=!0,this.colliders.instanceMatrix.needsUpdate=!0,this.labelMeshes=Array.from({length:8},(a,o)=>{let l=Zw(o+1);this.textures.push(l);let c=new Nt(new Ri(.51,.57),new dt({map:l,transparent:!0,depthWrite:!1,alphaTest:.1,toneMapped:!1}),this.count);return c.count=0,c.renderOrder=4,this.board.add(c),c}),this.flagPoles=new Nt(new Bi(.016,.024,.72,6),new Ht({color:"#dfbd7f",metalness:.7,roughness:.3}),this.count),this.flagCrystals=new Nt(new ki(.17),new Ht({color:"#f9bc68",emissive:"#b77724",emissiveIntensity:.9,metalness:.45,roughness:.25}),this.count),this.flagRings=new Nt(new rn(.21,.012,5,24),new dt({color:"#e6b86f"}),this.count),this.mines=new Ga(fs,e.mines),this.board.add(this.mines.group),this.wrongMarks=new Nt(new jt(.55,.025,.06),new dt({color:"#f1a19a"}),this.count*2),this.board.add(this.flagPoles,this.flagCrystals,this.flagRings,this.wrongMarks),this.createFoundation(),this.createCursor(),this.createPulse(),this.update(e,{changed:[],action:"noop"}),this.resetCamera()}update(e,t={changed:[],action:"noop"}){let i=this.snapshot?.status;if(this.snapshot=e,!!this.tiles){t.action==="lose"&&this.detonation.start(e),this.presentation=this.detonation.present(e);for(let n of t.changed)this.motions[n]=this.reducedMotion.matches?1:0;if(this.drawTiles(),this.drawSymbols(),t.action!=="noop"&&t.action!=="lose"&&t.changed.length){let n=this.position(t.changed[0]);this.effects.trigger(t.action,{...n,y:.35}),this.pulse.position.set(n.x,.34,n.z),this.pulse.material.color.set(e.status==="lost"?"#ff855b":"#97ddd5"),this.pulseAge=this.reducedMotion.matches?99:0}e.status==="won"&&(this.trimMaterial.color.set("#adf2c9"),i!=="won"&&this.fireworks.start({width:this.width,height:this.height})),e.status==="lost"&&this.trimMaterial.color.set("#cd7959")}}setMode(e){this.mode=e}focus(e){this.hoverId=-1,this.focusId=e,this.drawTiles()}clearFocus(){this.focusId=-1,this.drawTiles()}setTopView(e){this.topView=e,this.controls.enableRotate=!e,this.resetCamera(!1)}resetCamera(e=!0){this.controls.target.set(0,-.1,0),this.topView?this.camera.position.set(0,30,.01):this.camera.position.set(13,20,21),this.camera.lookAt(this.controls.target),e&&(this.camera.zoom=1),this.resize(),this.controls.update(),this.refreshCursor()}projectCell(e){let t=this.position(e),i=new C(t.x,.3,t.z).project(this.camera),n=this.renderer.domElement.getBoundingClientRect();return{x:n.left+(i.x+1)*n.width/2,y:n.top+(1-i.y)*n.height/2}}resize(){let e=this.container.clientWidth,t=this.container.clientHeight;if(!e||!t)return;this.renderer.setSize(e,t),this.composer.setSize(e,t);let i=e/t,n=(this.width||9)*1.06,r=(this.height||9)*1.06,a=this.topView?n+3:n*.87+r*.5+3.1,o=this.topView?r+3.2:r*.64+n*.38+5.7,l=Math.max(o,a/i)/2;this.camera.left=-l*i,this.camera.right=l*i,this.camera.top=l,this.camera.bottom=-l,this.camera.updateProjectionMatrix()}setupLighting(){this.scene.add(new Zs("#c4e2eb","#121622",2));let e=new vn("#e3edf1",3.8);e.position.set(-5,13,9),this.scene.add(e);let t=new vn("#5997b9",2.6);t.position.set(7,4,-9),this.scene.add(t);let i=new vn("#bc9270",.6);i.position.set(-7,1,-3),this.scene.add(i);let n=new vn("#537a8d",1.6);n.position.set(4,-3,8),this.scene.add(n)}createFoundation(){let e=this.width*1.06,t=this.height*1.06,i=Math.max(e,t),n=$w(324),r=new Ht({color:"#283442",metalness:.48,roughness:.72,flatShading:!0}),a=new Ht({color:"#1e2633",metalness:.3,roughness:.78,flatShading:!0}),o=new Ht({color:"#607d8b",metalness:.7,roughness:.34});this.trimMaterial=new dt({color:new ae("#51b7c6").multiplyScalar(1.6)});let l=new dt({color:new ae("#63e9f0").multiplyScalar(2.2)}),c=new Bi(.67,.22,1,4,1);c.rotateY(Math.PI/4);let h=new Nt(c,r,this.count),d=new Nt(new jt(.018,1,.025),l,this.count);for(let b=0;b<this.count;b++){let M=this.position(b),x=.7+(1-Math.hypot(M.x/e,M.z/t))*1+n()*.95;this.setInstance(h,b,M.x,-x/2-.14,M.z,1,x,1),h.setColorAt(b,new ae().setHSL(.58,.17+n()*.13,.5+n()*.22)),this.setInstance(d,b,M.x+.33,-x*.35,M.z+.33,1,x*.57,1)}h.instanceMatrix.needsUpdate=!0,d.instanceMatrix.needsUpdate=!0,this.board.add(h,d);let u=new st(new rs(1,0),a);u.scale.set(e*.43,1.6,t*.43),u.position.set(0,-1.75,0),u.rotation.y=.13,this.board.add(u),this.core=new st(new ki(.75,0),new Ht({color:"#41616b",emissive:"#2e9fb2",emissiveIntensity:1.05,metalness:.42,roughness:.48})),this.core.position.set(e*.08,-3.5,t*.32),this.core.scale.y=1.65,this.core.rotation.y=.4,this.board.add(this.core);let f=new $s("#387d8d",7,i*1.4,2);f.position.copy(this.core.position),this.board.add(f);let p=new dt({color:"#499ba5"});for(let b=0;b<3;b++){let M=new st(new rn(1+b*.16,b===0?.025:.014,6,72,Math.PI*1.72),b===0?p:o);M.position.copy(this.core.position),M.rotation.set(.6+b*.8,b*1.3,b*.5),this.board.add(M)}let _=Kw();this.textures.push(_);let g=new ks(new ns({map:_,color:"#399fb1",transparent:!0,opacity:.14,blending:zn,depthWrite:!1}));g.position.copy(this.core.position),g.scale.set(3.2,3.2,1),this.board.add(g),this.orbitalRings=new Ei,this.orbitalRings.position.y=-1.15;let m=Math.hypot(e,t)*.57;for(let b=0;b<3;b++){let M=new st(new rn(m+b*.33,b===0?.028:.013,5,150,Math.PI*(b===0?1.85:1.5)),b===0?this.trimMaterial:new dt({color:b===1?"#344361":"#526572",transparent:!0,opacity:.6}));M.rotation.set(Math.PI/2+b*.045,.08*b,b*2.2),this.orbitalRings.add(M)}let y=new Nt(new jt(1,.02,.02),new dt({color:16777215}),56);for(let b=0;b<56;b++){let M=b/56*Math.PI*2;this.dummy.position.set(Math.cos(M)*(m+.2),0,Math.sin(M)*(m+.2)),this.dummy.rotation.set(0,-M,0),this.dummy.scale.set(b%7===0?.3:.1,1,1),this.dummy.updateMatrix(),y.setMatrixAt(b,this.dummy.matrix),y.setColorAt(b,b%7===0?this.trimMaterial.color:new ae("#415766"))}y.instanceMatrix.needsUpdate=!0,this.orbitalRings.add(y),this.board.add(this.orbitalRings);let w=new st(new Ri(e*2,t*2),new dt({map:_,color:"#274775",transparent:!0,opacity:.3,depthWrite:!1,side:mi,blending:zn}));w.rotation.x=-Math.PI/2,w.position.y=-3.8,this.board.add(w);let v=new Nt(new rs(1,0),a,22);for(let b=0;b<22;b++){let M=n()*Math.PI*2,A=m*(.95+n()*.32),x=.16+n()*.38;this.dummy.position.set(Math.cos(M)*A,-1.2-n()*2.8,Math.sin(M)*A),this.dummy.scale.set(x*.7,x*(.7+n()*1.4),x*1.1),this.dummy.rotation.set(n()*3,n()*3,n()*3),this.dummy.updateMatrix(),v.setMatrixAt(b,this.dummy.matrix)}v.instanceMatrix.needsUpdate=!0,this.board.add(v);for(let b of[-1,1])for(let M of[-1,1]){let A=new C(b*(e/2+.08),-.1,M*(t/2+.08)),x=new st(new Bi(.055,.15,.75,5),o);x.position.copy(A).y+=.33;let T=new st(new ki(.1),l);T.position.copy(A).y+=.77,this.board.add(x,T)}}createCursor(){this.cursor=new Ei;let e=new dt({color:"#ffe0a5",transparent:!0,opacity:.92});this.cursorMaterial=e;for(let t of[-1,1])for(let i of[-1,1]){let n=new st(new jt(.2,.016,.026),e);n.position.set(t*.42,0,i*.5);let r=new st(new jt(.026,.016,.2),e);r.position.set(t*.5,0,i*.42),this.cursor.add(n,r)}this.cursor.visible=!1,this.board.add(this.cursor)}createPulse(){this.pulse=new st(new as(.92,1,80),new dt({color:"#91dad8",side:mi,transparent:!0,opacity:0,depthWrite:!1})),this.pulse.rotation.x=-Math.PI/2,this.pulseAge=99,this.board.add(this.pulse)}drawTiles(){for(let e of this.presentation.cells){let t=this.position(e.id),i=this.motions[e.id],n=1-Math.pow(1-i,3),r=e.id===this.hoverId||e.id===this.focusId,a=e.revealed?.09+.22*(1-n):.31+(r?.045:0);this.setInstance(this.tiles,e.id,t.x,-.04,t.z,1,a/.27,1);let o=e.wrongFlag||e.exploded||e.revealed&&e.mine?cr.danger:e.revealed?r?cr.openHover:cr.open:e.flagged?r?cr.flaggedHover:cr.flagged:r?cr.hover:cr.closed;this.tiles.setColorAt(e.id,o),this.dummy.position.set(t.x,a+.029,t.z),this.dummy.rotation.set(-Math.PI/2,0,0),this.dummy.scale.setScalar(e.revealed?0:1),this.dummy.updateMatrix(),this.slits.setMatrixAt(e.id,this.dummy.matrix),this.dummy.position.set(t.x,.13,t.z),this.dummy.rotation.set(-Math.PI/2,0,0),this.dummy.scale.setScalar(e.revealed&&!e.mine&&e.adjacent===0?1:0),this.dummy.updateMatrix(),this.innerLights.setMatrixAt(e.id,this.dummy.matrix)}this.tiles.instanceMatrix.needsUpdate=!0,this.tiles.instanceColor.needsUpdate=!0,this.slits.instanceMatrix.needsUpdate=!0,this.innerLights.instanceMatrix.needsUpdate=!0,this.refreshCursor()}drawSymbols(){let e=Array.from({length:8},()=>[]),t=0,i=0;for(let n of this.presentation.cells){let r=this.position(n.id);if(n.revealed&&n.adjacent>0&&!n.mine&&e[n.adjacent-1].push(r),n.wrongFlag)for(let a of[-Math.PI/4,Math.PI/4])this.dummy.position.set(r.x,.38,r.z),this.dummy.rotation.set(0,a,0),this.dummy.scale.setScalar(1),this.dummy.updateMatrix(),this.wrongMarks.setMatrixAt(i++,this.dummy.matrix);n.flagged&&!n.revealed&&!n.wrongFlag&&(this.setInstance(this.flagPoles,t,r.x,.59,r.z),this.setInstance(this.flagCrystals,t,r.x,1.03,r.z,.8,1.45,.8),this.dummy.position.set(r.x,.43,r.z),this.dummy.rotation.set(-Math.PI/2,0,0),this.dummy.scale.setScalar(1),this.dummy.updateMatrix(),this.flagRings.setMatrixAt(t,this.dummy.matrix),t++)}for(let n of[this.flagPoles,this.flagCrystals,this.flagRings])n.count=t,n.instanceMatrix.needsUpdate=!0,n.computeBoundingSphere();this.updateMineModels(),this.labels=e,this.wrongMarks.count=i,this.wrongMarks.instanceMatrix.needsUpdate=!0,this.wrongMarks.computeBoundingSphere(),this.updateLabels()}updateMineModels(){let e=[];for(let t of this.presentation.cells)!t.revealed||!t.mine||e.push({id:t.id,...this.position(t.id),...this.detonation.stage(t.id)});this.mines.update(e)}advanceDetonation(e){if(!this.detonation.active)return;let t=this.detonation.advance(e);if(t.revealed.length){this.presentation=this.detonation.present(this.snapshot);for(let i of t.revealed)this.motions[i]=this.reducedMotion.matches?1:0;this.drawTiles(),this.drawSymbols()}for(let i of t.explosions){let n=this.position(i.id);this.effects.trigger("lose",{...n,y:.48});let r=new C(n.x,.48,n.z).project(this.camera);this.callbacks.onExplosion?.({index:i.index,total:this.detonation.entries.length,pan:Math.max(-.8,Math.min(.8,r.x))})}t.revealed.length||this.updateMineModels(),t.finished&&this.callbacks.onChainComplete?.()}updateLabels(){this.labels&&this.labels.forEach((e,t)=>{let i=this.labelMeshes[t];i.count=e.length,e.forEach((n,r)=>{this.dummy.position.set(n.x,.32,n.z),this.dummy.quaternion.copy(this.camera.quaternion),this.dummy.scale.setScalar(1),this.dummy.updateMatrix(),i.setMatrixAt(r,this.dummy.matrix)}),i.instanceMatrix.needsUpdate=!0,i.computeBoundingSphere()})}refreshCursor(){if(!this.cursor)return;let e=this.hoverId>=0?this.hoverId:this.focusId;if(this.cursor.visible=e>=0,e>=0){let t=this.position(e);this.cursor.position.set(t.x,.42,t.z),this.cursorMaterial.color.set("#ffe0a5")}}position(e){return{x:(e%this.width-(this.width-1)/2)*1.06,z:(Math.floor(e/this.width)-(this.height-1)/2)*1.06}}setInstance(e,t,i,n,r,a=1,o=1,l=1){this.dummy.position.set(i,n,r),this.dummy.rotation.set(0,0,0),this.dummy.scale.set(a,o,l),this.dummy.updateMatrix(),e.setMatrixAt(t,this.dummy.matrix)}pick(e){if(!this.colliders)return-1;let t=this.renderer.domElement.getBoundingClientRect();return this.pointer.set((e.clientX-t.left)/t.width*2-1,-(e.clientY-t.top)/t.height*2+1),this.camera.updateMatrixWorld(),this.board.updateMatrixWorld(!0),this.raycaster.setFromCamera(this.pointer,this.camera),this.raycaster.intersectObject(this.colliders,!1)[0]?.instanceId??-1}bindEvents(){let e=this.renderer.domElement;e.addEventListener("contextmenu",t=>t.preventDefault()),e.addEventListener("webglcontextlost",t=>{t.preventDefault(),this.callbacks.onFailure(new Error("WebGL context lost"))}),e.addEventListener("pointerdown",t=>{if(this.clearFocus(),this.pointers.add(t.pointerId),this.pointers.size>1){this.pointerState&&(this.pointerState.cancelled=!0),clearTimeout(this.longPressTimer);return}let i=this.pick(t);this.pointerState={x:t.clientX,y:t.clientY,id:i,button:t.button,cancelled:!1,consumed:!1},t.pointerType==="touch"&&i>=0&&(this.longPressTimer=setTimeout(()=>{this.pointerState&&!this.pointerState.cancelled&&(this.pointerState.consumed=!0,this.callbacks.onFlag(i))},480))}),e.addEventListener("pointermove",t=>{this.pointerState&&Math.hypot(t.clientX-this.pointerState.x,t.clientY-this.pointerState.y)>6&&(this.pointerState.cancelled=!0,clearTimeout(this.longPressTimer));let i=this.pick(t),n=this.focusId>=0;this.focusId=-1,(i!==this.hoverId||n)&&(this.hoverId=i,e.style.cursor=i>=0?"crosshair":this.pointerState?"grabbing":"grab",this.drawTiles(),this.callbacks.onHover(i))}),e.addEventListener("pointerleave",()=>{this.hoverId=-1,this.drawTiles(),this.callbacks.onHover(-1)}),e.addEventListener("pointerup",t=>{let i=this.pointerState;t.pointerType!=="mouse"&&(this.hoverId=-1,this.focusId=-1,this.drawTiles()),this.pointers.delete(t.pointerId),clearTimeout(this.longPressTimer),this.pointers.size===0&&(this.pointerState=null),i?.cancelled&&(this.suppressDoubleClickUntil=performance.now()+450),!(!i||i.cancelled||i.consumed||i.id<0)&&(Math.hypot(t.clientX-i.x,t.clientY-i.y)>6||(t.button===2||this.mode==="flag"?this.callbacks.onFlag(i.id):t.button===0&&this.callbacks.onReveal(i.id)))}),e.addEventListener("pointercancel",()=>this.cancelPointerInput()),e.addEventListener("dblclick",t=>{if(performance.now()<(this.suppressDoubleClickUntil||0))return;let i=this.pick(t);i>=0&&this.callbacks.onChord(i)}),this.controls.addEventListener("change",()=>this.updateLabels()),this.controls.addEventListener("cancel",()=>this.cancelPointerInput())}cancelPointerInput(){clearTimeout(this.longPressTimer),this.pointers.clear(),this.pointerState=null,this.hoverId=-1,this.focusId=-1,this.disposed||(this.drawTiles(),this.callbacks.onHover(-1))}animate(e){if(this.frame=null,this.disposed||document.hidden)return;let t=this.lastTime>0?Math.max(0,(e-this.lastTime)/1e3):0,i=Math.min(t,.1);this.lastTime=e,this.controls.update(),this.cosmos.update(e/1e3,this.reducedMotion.matches,this.camera,t),this.effects.update(t,e/1e3);let n=this.fireworks.active;this.fireworks.update(t),n&&!this.fireworks.active&&this.callbacks.onFireworksStop?.(),this.advanceDetonation(t);let r=!1;for(let a=0;a<this.motions.length;a++)this.motions[a]<1&&(this.motions[a]=Math.min(1,this.motions[a]+i*3.8),r=!0);r&&this.drawTiles(),this.pulse&&this.pulseAge<1.1&&(this.pulseAge+=i,this.pulse.scale.setScalar(.3+this.pulseAge*4),this.pulse.material.opacity=Math.max(0,(1-this.pulseAge)*.35)),this.orbitalRings&&!this.reducedMotion.matches&&(this.orbitalRings.rotation.y=e*4e-5,this.core.material.emissiveIntensity=1.05+Math.sin(e*.0018)*.06),this.composer.render(),this.frame=requestAnimationFrame(a=>this.animate(a))}disposeGroup(e){let t=new Set,i=new Set;e.traverse(n=>{n.isInstancedMesh&&n.dispose(),n.geometry&&t.add(n.geometry),n.material&&(Array.isArray(n.material)?n.material:[n.material]).forEach(r=>i.add(r))}),t.forEach(n=>n.dispose()),i.forEach(n=>n.dispose())}dispose(){this.disposed=!0,cancelAnimationFrame(this.frame),clearTimeout(this.longPressTimer),document.removeEventListener("visibilitychange",this.onVisibility),this.resizeObserver.disconnect(),this.controls.dispose(),this.cosmos.dispose(),this.effects.dispose(),this.fireworks.dispose(),this.callbacks.onFireworksStop?.(),this.detonation.reset(),this.mines?.dispose(),this.disposeGroup(this.scene),this.textures.forEach(e=>e.dispose()),this.composer.passes.forEach(e=>e.dispose()),this.composer.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function k0(s,e,t){return Yw(s,s,e,t)}function Yw(s,e,t,i){let n=new zi,r=-s/2,a=-e/2,o=i;n.moveTo(r+o,a),n.lineTo(r+s-o,a),n.quadraticCurveTo(r+s,a,r+s,a+o),n.lineTo(r+s,a+e-o),n.quadraticCurveTo(r+s,a+e,r+s-o,a+e),n.lineTo(r+o,a+e),n.quadraticCurveTo(r,a+e,r,a+e-o),n.lineTo(r,a+o),n.quadraticCurveTo(r,a,r+o,a);let l=new Ws(n,{depth:t,bevelEnabled:!0,bevelSegments:2,steps:1,bevelSize:i*.4,bevelThickness:i*.4,curveSegments:3});return l.rotateX(-Math.PI/2),l}function Zw(s){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d");t.font="700 96px ui-monospace, SFMono-Regular, Menlo, monospace",t.textAlign="center",t.textBaseline="middle",t.fillStyle="#fff4db",t.fillText(String(s),64,69);let i=new mn(e);return i.colorSpace=zt,i}function Kw(){let s=document.createElement("canvas");s.width=s.height=128;let e=s.getContext("2d"),t=e.createRadialGradient(64,64,0,64,64,64);return t.addColorStop(0,"rgba(255,255,255,0.9)"),t.addColorStop(.42,"rgba(255,255,255,0.4)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,128,128),new mn(s)}function Jw(){let s=document.createElement("canvas");s.width=s.height=128;let e=s.getContext("2d");e.strokeStyle="#d9c9aa",e.lineWidth=1.3;for(let[t,i,n,r]of[[12,12,1,1],[116,12,-1,1],[12,116,1,-1],[116,116,-1,-1]])e.beginPath(),e.moveTo(t,i+r*13),e.lineTo(t,i),e.lineTo(t+n*13,i),e.stroke();return e.strokeStyle="rgba(217,201,170,0.7)",e.beginPath(),e.moveTo(64,57),e.lineTo(71,64),e.lineTo(64,71),e.lineTo(57,64),e.closePath(),e.stroke(),new mn(s)}function $w(s){return()=>(s=s*1664525+1013904223>>>0,s/4294967296)}var qu=class{constructor(){this.enabled=!0,this.musicEnabled=!0,this.context=null,this.mood="ready",this.unlocked=!1,this.disposed=!1,this.voices=new Set,this.scheduler=null,this.beat=0,this.nextBeatAt=0,this.onVisibility=()=>this.handleVisibility(),globalThis.document?.addEventListener("visibilitychange",this.onVisibility)}async unlock(){if(this.disposed||this.isHidden())return!1;if(!this.context){let e=globalThis.AudioContext||globalThis.webkitAudioContext;if(!e)return!1;try{this.context=new e({latencyHint:"interactive"}),this.createGraph()}catch{try{await this.context?.close()}catch{}return this.context=null,!1}}if(this.context.state==="closed")return!1;this.unlocked=!0;try{return this.context.state!=="running"&&await this.context.resume(),this.disposed||this.isHidden()?(await this.context.suspend().catch(()=>{}),!1):(this.syncGains(),this.startMusic(),this.context.state==="running")}catch{return this.stopMusic(),!1}}setEnabled(e){this.enabled=!!e,this.setBus(this.sfxGain,this.enabled?.78:0),this.enabled||this.stopVoices("sfx")}setMusicEnabled(e){this.musicEnabled=!!e,this.setBus(this.musicGain,this.musicLevel()),this.musicEnabled?this.startMusic():this.stopMusic()}play(e){if(e==="lose"){this.playExplosion();return}if(!this.canPlay("sfx"))return;let t=e==="win"?[440,523.25,659.25,880]:e==="flag"?[659.25,987.77]:e==="unflag"?[493.88,329.63]:e==="chord"?[329.63,493.88,659.25]:e==="reveal"?[261.63,392]:[],i=this.context.currentTime+.005;t.forEach((n,r)=>this.tone(n,i+r*.065,e==="win"?.5:.2,.045,"sfx"))}playExplosion({index:e=0,total:t=1,pan:i=0}={}){if(!this.canPlay("sfx"))return;let n=this.context,r=Number.isFinite(e)?Math.max(0,Math.floor(e)):0,a=Number.isFinite(t)?Math.max(1,t):1,o=(r*37+11)%23/23,l=r===0?1:(.66+o*.17)*(a>40?.88:1),c=n.currentTime+.004,h=[...this.voices].filter(A=>A.group==="sfx"&&A.explosion),d=r<3?1:Math.min(1,Math.sqrt(3/(h.length+1)));h.length>=9&&h[0].stop();let u=n.createGain();u.gain.value=l*d;let f=n.createStereoPanner?n.createStereoPanner():n.createGain();f.pan&&(f.pan.value=Number.isFinite(i)?Math.max(-1,Math.min(1,i)):0),u.connect(f),f.connect(this.sfxGain);let p=[u,f],_=[],g=n.createBufferSource();g.buffer=this.noiseBuffer,g.playbackRate.value=.82+o*.35;let m=n.createBiquadFilter();m.type="lowpass",m.Q.value=.8,m.frequency.setValueAtTime(1750+o*700,c),m.frequency.exponentialRampToValueAtTime(125,c+.34);let y=n.createGain();this.envelope(y.gain,c,.004,.29,.38),g.connect(m).connect(y).connect(u),p.push(m,y),_.push({source:g,at:c,duration:.41,offset:o*.3});for(let A=0;A<2;A+=1){let x=n.createOscillator(),T=n.createGain();x.type=A===0?"sine":"triangle",x.frequency.setValueAtTime((A===0?132:73)*(.9+o*.22),c),x.frequency.exponentialRampToValueAtTime(A===0?34:27,c+.38),this.envelope(T.gain,c,.003,A===0?.4:.09,A===0?.6:.35),x.connect(T).connect(u),p.push(T),_.push({source:x,at:c,duration:A===0?.64:.39})}let w=n.createBufferSource();w.buffer=this.noiseBuffer,w.playbackRate.value=1.25+o*.5;let v=n.createBiquadFilter();v.type="bandpass",v.frequency.setValueAtTime(3400+o*1900,c),v.frequency.exponentialRampToValueAtTime(1550,c+.72),v.Q.value=1.9;let b=n.createGain();this.envelope(b.gain,c+.028,.015,.105,.78),w.connect(v).connect(b).connect(u),p.push(v,b),_.push({source:w,at:c+.028,duration:.81,offset:.4});let M=this.registerVoice(_,p,"sfx");M&&(M.explosion=!0)}playFirework(e,{strength:t=1,pan:i=0}={}){if(e!=="launch"&&e!=="burst"||!this.canPlay("sfx"))return;let n=Number.isFinite(t)?Math.max(0,Math.min(1.5,t)):1;if(n===0)return;let r=[...this.voices].filter(y=>y.firework);r.length>=4&&r.shift().stop();let a=this.context,o=a.currentTime+.004,l=e==="launch",c=a.createGain();c.gain.value=n*Math.min(1,Math.sqrt(2/(r.length+1)));let h=a.createStereoPanner?a.createStereoPanner():a.createGain();h.pan&&(h.pan.value=Number.isFinite(i)?Math.max(-1,Math.min(1,i)):0),c.connect(h),h.connect(this.sfxGain);let d=[c,h],u=[],f=a.createBufferSource();f.buffer=this.noiseBuffer,f.playbackRate.value=l?.9:1.35;let p=a.createBiquadFilter();p.type="bandpass",p.Q.value=l?1.1:.8,p.frequency.setValueAtTime(l?700:1850,o),p.frequency.exponentialRampToValueAtTime(l?2250:1100,o+(l?.38:.085));let _=a.createGain();this.envelope(_.gain,o,l?.065:.003,l?.025:.065,l?.42:.105),f.connect(p).connect(_).connect(c),d.push(p,_),u.push({source:f,at:o,duration:l?.46:.14,offset:l?.15:.65}),(l?[880]:[1760,2637.02]).forEach((y,w)=>{let v=a.createOscillator(),b=a.createGain(),M=o+(l?.025:.022+w*.055),A=l?.36:.25+w*.06;v.type="sine",v.frequency.setValueAtTime(y,M),v.frequency.exponentialRampToValueAtTime(l?1760:y*.985,M+A),this.envelope(b.gain,M,l?.05:.005,l?.007:.009/(w+1),A),v.connect(b).connect(c),d.push(b),u.push({source:v,at:M,duration:A+.03})});let m=this.registerVoice(u,d,"sfx");m&&(m.firework=!0,m.fireworkPhase=e)}get fireworkVoiceCount(){let e=0;for(let t of this.voices)t.firework&&(e+=1);return e}stopFireworks(){for(let e of[...this.voices])e.firework&&e.stop()}setMood(e){if(["ready","playing","lost","won"].includes(e)&&(this.mood=e,this.musicGain&&this.context?.state!=="closed")){let t=this.context.currentTime;this.musicGain.gain.cancelScheduledValues(t),this.musicGain.gain.setTargetAtTime(this.musicLevel(),t,.15)}}reset(){this.disposed||(this.stopVoices("sfx"),this.stopMusic(),this.beat=0,this.setMood("ready"),this.startMusic())}dispose(){if(!this.disposed){this.disposed=!0,globalThis.document?.removeEventListener("visibilitychange",this.onVisibility),this.stopMusic(),this.stopVoices("sfx");for(let e of[this.sfxGain,this.musicGain,this.compressor,this.masterGain])try{e?.disconnect()}catch{}this.context&&(this.context.onstatechange=null,this.context.state!=="closed"&&this.context.close().catch(()=>{})),this.noiseBuffer=null}}createGraph(){let e=this.context;this.sfxGain=e.createGain(),this.musicGain=e.createGain(),this.compressor=e.createDynamicsCompressor(),this.masterGain=e.createGain(),this.compressor.threshold.value=-17,this.compressor.knee.value=20,this.compressor.ratio.value=4,this.compressor.attack.value=.006,this.compressor.release.value=.18,this.masterGain.gain.value=.7,this.sfxGain.connect(this.compressor),this.musicGain.connect(this.compressor),this.compressor.connect(this.masterGain).connect(e.destination),this.noiseBuffer=e.createBuffer(1,Math.ceil(e.sampleRate*2),e.sampleRate);let t=this.noiseBuffer.getChannelData(0);for(let i=0;i<t.length;i+=1)t[i]=Math.random()*2-1;this.syncGains(),e.onstatechange=()=>{this.disposed||(e.state==="running"&&!this.isHidden()?this.startMusic():this.stopMusic())}}canPlay(e){return!this.disposed&&!this.isHidden()&&this.context?.state==="running"&&(e==="music"?this.musicEnabled:this.enabled)}isHidden(){return globalThis.document?.hidden===!0}setBus(e,t){if(!(!e||!this.context||this.context.state==="closed"))try{e.gain.cancelScheduledValues(0),e.gain.value=t,e.gain.setValueAtTime(t,this.context.currentTime)}catch{}}syncGains(){this.setBus(this.sfxGain,this.enabled?.78:0),this.setBus(this.musicGain,this.musicLevel())}musicLevel(){return this.musicEnabled?this.mood==="lost"?.085:this.mood==="won"?.19:.2:0}envelope(e,t,i,n,r){e.setValueAtTime(0,t),e.linearRampToValueAtTime(n,t+i),e.exponentialRampToValueAtTime(1e-4,t+r),e.linearRampToValueAtTime(0,t+r+.02)}registerVoice(e,t,i){if(!this.context||this.context.state==="closed"||this.disposed){for(let r of[...e.map(a=>a.source),...t])try{r.disconnect()}catch{}return null}let n={group:i,sources:e.map(r=>r.source),ended:0,cleaned:!1};n.cleanup=()=>{if(!n.cleaned){n.cleaned=!0,this.voices.delete(n);for(let r of[...n.sources,...t])try{r.disconnect()}catch{}}},n.stop=()=>{for(let r of n.sources)try{r.stop()}catch{}n.cleanup()},this.voices.add(n);try{for(let r of e)r.source.onended=()=>{n.ended+=1,n.ended===e.length&&n.cleanup()},r.offset!==void 0?r.source.start(r.at,r.offset):r.source.start(r.at),r.source.stop(r.at+r.duration)}catch{return n.stop(),null}return n}stopVoices(e){for(let t of[...this.voices])t.group===e&&t.stop()}tone(e,t,i,n,r){if(!this.canPlay(r))return;let a=this.context.createOscillator(),o=this.context.createGain();a.type="sine",a.frequency.setValueAtTime(e,t),this.envelope(o.gain,t,.006,n,i),a.connect(o).connect(r==="music"?this.musicGain:this.sfxGain),this.registerVoice([{source:a,at:t,duration:i+.03}],[o],r)}startMusic(){this.scheduler!==null||!this.unlocked||!this.canPlay("music")||(this.nextBeatAt=this.context.currentTime+.035,this.beat-=this.beat%8,this.scheduler=setInterval(()=>this.scheduleMusic(),60),this.scheduleMusic())}stopMusic(){this.scheduler!==null&&clearInterval(this.scheduler),this.scheduler=null,this.stopVoices("music")}scheduleMusic(){if(!this.canPlay("music")){this.stopMusic();return}let e=this.context.currentTime;this.nextBeatAt<e-.2&&(this.nextBeatAt=e+.025,this.beat-=this.beat%8);let t=0;for(;this.nextBeatAt<e+.18&&t<4;)this.scheduleBeat(this.beat,this.nextBeatAt),this.nextBeatAt+=60/52,this.beat+=1,t+=1}scheduleBeat(e,t){let i=[[57,60,64],[53,57,60],[48,55,60],[55,59,62]],n=i[Math.floor(e/8)%i.length];if(e%8===0&&this.pad(n,t,60/52*8+.65),e%4===2&&this.mood!=="lost"){let a=440*2**((n[Math.floor(e/4)%n.length]+12-69)/12);this.tone(a,t,1.65,.052,"music"),this.tone(a*2.004,t+.012,.9,.008,"music")}if(e%2===0&&this.mood!=="lost"){let r=this.context.createOscillator(),a=this.context.createGain();r.type="sine",r.frequency.setValueAtTime(62,t),r.frequency.exponentialRampToValueAtTime(43,t+.32),this.envelope(a.gain,t,.03,.07,.37),r.connect(a).connect(this.musicGain),this.registerVoice([{source:r,at:t,duration:.42}],[a],"music")}}pad(e,t,i){let n=this.context,r=n.createBiquadFilter();r.type="lowpass",r.Q.value=.5,r.frequency.setValueAtTime(this.mood==="lost"?330:640,t),r.frequency.linearRampToValueAtTime(this.mood==="lost"?260:850,t+i*.45),r.frequency.linearRampToValueAtTime(420,t+i);let a=n.createGain();a.gain.setValueAtTime(0,t),a.gain.linearRampToValueAtTime(.06,t+1.25),a.gain.setValueAtTime(.06,t+i-1.45),a.gain.linearRampToValueAtTime(0,t+i),r.connect(a).connect(this.musicGain);let o=[];for(let l of e)for(let c of[-4,4]){let h=n.createOscillator();h.type=c<0?"sine":"triangle",h.frequency.value=440*2**((l-69)/12),h.detune.value=c,h.connect(r),o.push({source:h,at:t,duration:i+.025})}this.registerVoice(o,[r,a],"music")}async handleVisibility(){if(!(!this.context||this.disposed||this.context.state==="closed"))if(this.isHidden()){this.stopMusic(),this.stopVoices("sfx");try{await this.context.suspend()}catch{}}else this.unlocked&&(this.enabled||this.musicEnabled)&&await this.unlock()}};var jw=1e-7,Yu=class extends ai{constructor(e,t){super(),this.object=e,this.domElement=t,this.target=new C,this.enabled=!0,this.enableRotate=!0,this.enableDamping=!0,this.dampingFactor=.1,this.rotateSpeed=.7,this.zoomSpeed=.8,this.minZoom=.65,this.maxZoom=4,this._pointers=new Map,this._gesture=null,this._rotation=new Z,this._zoomDelta=0,this._offset=new C,this._forward=new C,this._up=new C,this._right=new C,this._axis=new C,this._quaternion=new bt,this._disposed=!1,this._previousTouchAction=t.style.touchAction,t.style.touchAction="none",this._handlers={pointerdown:i=>this._pointerDown(i),pointermove:i=>this._pointerMove(i),pointerup:i=>this._pointerEnd(i),pointercancel:()=>this.cancel(),lostpointercapture:i=>{this._pointers.has(i.pointerId)&&this.cancel()},wheel:i=>this._wheel(i)};for(let[i,n]of Object.entries(this._handlers))t.addEventListener(i,n,{passive:!1});this._view=t.ownerDocument?.defaultView??globalThis.window,this._onBlur=()=>this.cancel(),this._view?.addEventListener("blur",this._onBlur)}update(){if(this._disposed)return!1;if(!this.enabled)return this.stop(),!1;let e=!1;if(this.enableRotate||this._rotation.set(0,0),this._rotation.length()>jw){let t=this.enableDamping&&Number.isFinite(this.dampingFactor)&&this.dampingFactor>0?Math.min(1,this.dampingFactor):1,i=this._rotation.x*t,n=this._rotation.y*t;this._rotation.multiplyScalar(1-t),e=this._rotate(i,n)}else this._rotation.set(0,0);if(this._zoomDelta!==0){let t=this.object.zoom,i=t*Math.exp(Math.max(-50,Math.min(50,this._zoomDelta)));this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,i)),this._zoomDelta=0,this.object.zoom!==t&&(this.object.updateProjectionMatrix(),e=!0)}return e&&(this.object.updateMatrixWorld(),this.dispatchEvent({type:"change"})),e}stop(){this._rotation.set(0,0),this._zoomDelta=0,this._gesture=this._readGesture()}cancel(){this._disposed||(this._cancelGestures(),this.dispatchEvent({type:"cancel"}))}dispose(){if(!this._disposed){this._disposed=!0;for(let[e,t]of Object.entries(this._handlers))this.domElement.removeEventListener(e,t);this._view?.removeEventListener("blur",this._onBlur),this._cancelGestures(),this.domElement.style.touchAction==="none"&&(this.domElement.style.touchAction=this._previousTouchAction)}}_rotate(e,t){let i=this.object;return this._offset.copy(i.position).sub(this.target),this._offset.lengthSq()<1e-16?!1:(this._forward.copy(this._offset).normalize(),this._up.copy(i.up).normalize(),this._right.crossVectors(this._up,this._forward),this._right.lengthSq()<1e-12&&(this._up.set(0,1,0),Math.abs(this._forward.y)>.9&&this._up.set(0,0,1),this._right.crossVectors(this._up,this._forward)),this._right.normalize(),this._up.crossVectors(this._forward,this._right).normalize(),this._axis.copy(this._right).multiplyScalar(-t).addScaledVector(this._up,-e).normalize(),this._quaternion.setFromAxisAngle(this._axis,Math.hypot(e,t)),this._offset.applyQuaternion(this._quaternion),i.position.copy(this.target).add(this._offset),i.up.copy(this._up).applyQuaternion(this._quaternion).normalize(),i.lookAt(this.target),!0)}_pointerDown(e){if(!(!this.enabled||this._disposed)&&!(e.pointerType!=="touch"&&e.button!==0&&e.button!==1)&&!(!Number.isFinite(e.clientX)||!Number.isFinite(e.clientY))){e.button===1&&e.preventDefault(),this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,button:e.pointerType==="touch"?0:e.button}),this.stop();try{this.domElement.setPointerCapture(e.pointerId)}catch{}}}_pointerMove(e){let t=this._pointers.get(e.pointerId);if(!t||!Number.isFinite(e.clientX)||!Number.isFinite(e.clientY))return;if(t.x=e.clientX,t.y=e.clientY,!this.enabled){this.stop();return}let i=this._gesture,n=this._readGesture();if(this._gesture=n,!i||i.mode!==n.mode)return;let r=this.domElement.getBoundingClientRect().height;if(!Number.isFinite(r)||r<=0)return;let a=n.x-i.x,o=n.y-i.y;if(n.mode==="zoom"){this._zoomDelta-=o/r*4*this.zoomSpeed;return}if(this.enableRotate){let l=Math.PI*2*this.rotateSpeed/r;this._rotation.x+=a*l,this._rotation.y+=o*l}n.mode==="pinch"&&i.distance>.01&&n.distance>.01&&(this._zoomDelta+=Math.log(n.distance/i.distance)*this.zoomSpeed)}_pointerEnd(e){this._pointers.delete(e.pointerId)&&(this._release(e.pointerId),this._pointers.size>0?this.stop():this._gesture=null)}_readGesture(){let e=[...this._pointers.values()];if(!e.length)return null;let[t,i]=e;return i?{mode:"pinch",x:(t.x+i.x)/2,y:(t.y+i.y)/2,distance:Math.hypot(i.x-t.x,i.y-t.y)}:{mode:t.button===1?"zoom":"rotate",x:t.x,y:t.y}}_cancelGestures(){let e=[...this._pointers.keys()];this._pointers.clear(),this.stop();for(let t of e)this._release(t)}_wheel(e){if(!this.enabled||this._disposed||!Number.isFinite(e.deltaY))return;e.preventDefault();let t=e.deltaMode===1?16:e.deltaMode===2?this.domElement.getBoundingClientRect().height:1;Number.isFinite(t)&&t>0&&(this._zoomDelta-=e.deltaY*t*.001*this.zoomSpeed)}_release(e){try{this.domElement.hasPointerCapture(e)&&this.domElement.releasePointerCapture(e)}catch{}}};var up=new C(0,1,0),Si={closed:new ae("#b87b51"),open:new ae("#6b4734"),flagged:new ae("#28434a"),mine:new ae("#95483a"),neighbor:new ae("#d3ad82"),selected:new ae("#e7bd82"),openNeighbor:new ae("#7b5640"),openSelected:new ae("#8b674b"),flaggedNeighbor:new ae("#34555b"),flaggedSelected:new ae("#43636a"),edge:new ae("#987756"),openEdge:new ae("#9b7760"),side:new ae("#553c2e")},Zu=class extends Ha{constructor(e,t){super(e,t),this.surfaceView=!0,this.highlightedIds=[],this.activeCellId=-1,this.renderer.toneMappingExposure=1.2,this.scene.add(new js("#acc7d8",.85)),this.bloom.strength=.3,this.bloom.threshold=1.1}createControls(){return new Yu(this.camera,this.renderer.domElement)}rebuild(e){if(e.topology?.kind!=="surface")throw new TypeError("SurfaceScene requires a surface topology");this.detonation.reset(),this.fireworks.clear(),this.callbacks.onFireworksStop?.(),this.effects.clear(),this.mines?.dispose(),this.disposeGroup(this.board),this.board.clear(),this.textures.forEach(i=>i.dispose()),this.textures=[],this.snapshot=null,this.topology=e.topology,this.surfaceCells=this.topology.cells,this.width=e.width,this.height=e.height,this.count=this.surfaceCells.length,this.radius=this.topology.radius,this.hoverId=this.focusId=-1,this.drawnReveals=null,this.motions=new Float32Array(this.count).fill(1),this.maxDegree=Math.max(1,...this.surfaceCells.map(i=>i.neighbors.length)),this.labels=Array.from({length:this.maxDegree},()=>[]);let t=this.surfaceCells[0].corners;this.cellSize=new C().fromArray(t[0]).distanceTo(new C().fromArray(t[1])),this.cellFrames=this.surfaceCells.map(i=>{let n=new C().fromArray(i.center),r=new C().fromArray(i.normal).normalize(),a=new C().fromArray(i.corners[1]).sub(new C().fromArray(i.corners[0])).normalize(),o=new C().crossVectors(r,a).normalize();return{center:n,normal:r,tangentU:a,tangentV:o,labelRotation:new bt().setFromRotationMatrix(new qe().makeBasis(a,o,r)),rotation:new bt().setFromUnitVectors(up,r),scale:this.cellSize}}),this.createSurfaceGeometry(),this.createSurfaceSymbols(),this.mines=new Ga(fs,Math.max(1,e.mines)),this.board.add(this.mines.group),this.update(e),this.resetCamera()}createSurfaceGeometry(){let e=[],t=[],i=[],n=[],r=[],a=[],o=new C;for(let u of this.surfaceCells){let f=this.cellFrames[u.id];for(let v of[[0,1,2],[0,2,3]]){for(let b of v)e.push(...u.corners[b]);i.push(u.id)}let p=t.length/3,_=(v,b)=>[[-v,-v,b],[v,-v,b],[v,v,b],[-v,v,b]],g=_(.442,0),m=_(.47,1),y=_(.47,2),w=v=>{for(let[b,M,A]of v)o.copy(f.center).addScaledVector(f.tangentU,b*f.scale).addScaledVector(f.tangentV,M*f.scale),o.addScaledVector(f.normal,(A===0?.06:A===1?.032:.004)*f.scale),t.push(o.x,o.y,o.z),a.push(b,M),r.push(A)};w([g[0],g[1],g[2],g[0],g[2],g[3]]);for(let v=0;v<4;v++){let b=(v+1)%4;w([g[v],m[v],m[b],g[v],m[b],g[b]]),w([m[v],y[v],y[b],m[v],y[b],m[b]])}n[u.id]={start:p,count:t.length/3-p}}this.tileRanges=n,this.tileVertexRoles=new Uint8Array(r),this.tileLocalCoordinates=new Float32Array(a),this.triangleCellIds=i;let l=new Ye;l.setAttribute("position",new Te(e,3)),l.computeVertexNormals(),this.colliders=new st(l,new Ht({color:"#322c2a",roughness:.88,metalness:.25,flatShading:!0})),this.colliders.name="solid-unit-square-occluder",this.board.add(this.colliders);let c=new Ye;c.setAttribute("position",new Te(t,3).setUsage(ds)),c.setAttribute("color",new ft(new Float32Array(t.length),3).setUsage(ds)),c.computeVertexNormals(),this.tiles=new st(c,new Ht({vertexColors:!0,metalness:.48,roughness:.56,flatShading:!0})),this.tiles.name="solid-equal-square-alloy-covers",this.board.add(this.tiles);let h=new zi;h.moveTo(-.478,-.478),h.lineTo(.478,-.478),h.lineTo(.478,.478),h.lineTo(-.478,.478),h.closePath();let d=new gn;d.moveTo(-.465,-.465),d.lineTo(-.465,.465),d.lineTo(.465,.465),d.lineTo(.465,-.465),d.closePath(),h.holes.push(d),this.selectionOutline=new st(new Xs(h),new dt({color:"#ffe0a6",depthTest:!0,toneMapped:!1})),this.selectionOutline.name="solid-selected-face-outline",this.selectionOutline.visible=!1,this.board.add(this.selectionOutline)}createSurfaceSymbols(){let e=(t,i,n,r=this.count)=>{let a=new Nt(i,n,r);return a.name=t,a.count=0,a.frustumCulled=!1,a.instanceMatrix.setUsage(ds),this.board.add(a),a};this.labelMeshes=Array.from({length:this.maxDegree},(t,i)=>{let n=e1(i+1);this.textures.push(n);let r=e(`surface-number-${i+1}`,new Ri(.57,.63),new dt({map:n,transparent:!0,alphaTest:.15,depthTest:!0,depthWrite:!1,toneMapped:!1}));return r.renderOrder=3,r.userData.cellIds=[],r}),this.flagPoles=e("surface-beacon-stems",new Bi(.021,.029,.44,6),new Ht({color:"#dfbd7f",metalness:.65,roughness:.38})),this.flagCrystals=e("surface-beacon-lanterns",new ki(.125,0),new Ht({color:"#efbc70",emissive:"#ae6f26",emissiveIntensity:.55,metalness:.4,roughness:.38})),this.flagRings=e("surface-beacon-footings",new rn(.16,.016,5,20).rotateX(Math.PI/2),new dt({color:"#cca465"})),this.wrongMarks=e("surface-wrong-flags",new jt(.5,.035,.045),new dt({color:"#ed9585"}),this.count*2)}update(e,t={changed:[],action:"noop"}){let i=this.snapshot?.status;if(this.snapshot=e,!!this.tiles&&(t.action==="lose"&&this.startSurfaceDetonation(e),this.presentation=this.detonation.present(e),this.drawTiles(),this.drawSymbols(),e.status==="won"&&i!=="won")){let n=this.camera.position.clone().normalize();this.fireworks.root.position.copy(n.multiplyScalar(this.radius*.9)),this.fireworks.root.quaternion.copy(this.camera.quaternion),this.fireworks.root.scale.setScalar(this.radius/4.3),this.fireworks.start({width:8,height:6})}}drawTiles(){if(!this.tiles||!this.presentation)return;let e=this.hoverId>=0?this.hoverId:this.focusId;this.activeCellId=e,this.highlightedIds=e>=0?[e,...this.surfaceCells[e].neighbors]:[];let t=new Set(this.highlightedIds),i=this.tiles.geometry.attributes.position,n=this.tiles.geometry.attributes.color,r=new C,a=new ae,o=new ae,l=!1;this.drawnReveals??=new Uint8Array(this.count).fill(2);for(let c of this.presentation.cells){let h=this.cellFrames[c.id],d=this.tileRanges[c.id],u=c.revealed?c.mine?Si.mine:Si.open:c.flagged?Si.flagged:Si.closed;a.copy(u);let f=c.revealed&&!c.mine;c.id===e?a.lerp(f?Si.openSelected:c.flagged?Si.flaggedSelected:Si.selected,.28):t.has(c.id)&&a.lerp(f?Si.openNeighbor:c.flagged?Si.flaggedNeighbor:Si.neighbor,.3),a.multiplyScalar(.97+Qw(c.id+(Number(this.topology.seed)||1))*.06);let p=Number(c.revealed),_=this.drawnReveals[c.id]!==p;for(let g=d.start;g<d.start+d.count;g++){let m=this.tileVertexRoles[g];if(_){let y=m===0?c.revealed?.012:.06:m===1?.032:.004;r.copy(h.center).addScaledVector(h.tangentU,this.tileLocalCoordinates[g*2]*h.scale).addScaledVector(h.tangentV,this.tileLocalCoordinates[g*2+1]*h.scale).addScaledVector(h.normal,y*h.scale),i.setXYZ(g,r.x,r.y,r.z)}o.copy(m===0?a:m===1?f?Si.openEdge:Si.edge:Si.side),m===1&&t.has(c.id)&&o.lerp(Si.selected,.2),n.setXYZ(g,o.r,o.g,o.b)}l||=_,this.drawnReveals[c.id]=p}n.needsUpdate=!0,l&&(i.needsUpdate=!0,this.tiles.geometry.computeVertexNormals(),this.tiles.geometry.computeBoundingSphere()),this.refreshCursor()}refreshCursor(){if(!this.selectionOutline||!this.cellFrames)return;let e=this.hoverId>=0?this.hoverId:this.focusId;if(this.selectionOutline.visible=e>=0,e<0)return;let t=this.cellFrames[e];this.selectionOutline.position.copy(t.center).addScaledVector(t.normal,t.scale*.072),this.selectionOutline.quaternion.copy(t.labelRotation),this.selectionOutline.scale.setScalar(t.scale)}drawSymbols(){if(!this.presentation)return;this.labels=Array.from({length:this.maxDegree},()=>[]);let e=0,t=0;for(let i of this.presentation.cells){i.revealed&&!i.mine&&i.adjacent>0&&this.labels[i.adjacent-1]?.push(i.id);let n=this.cellFrames[i.id];if(i.wrongFlag)for(let r of[-Math.PI/4,Math.PI/4])this.placeSurface(this.wrongMarks,t++,n,.15,1,new bt().setFromAxisAngle(up,r));else i.flagged&&!i.revealed&&(this.placeSurface(this.flagPoles,e,n,.34),this.placeSurface(this.flagCrystals,e,n,.61),this.placeSurface(this.flagRings,e,n,.12),e++)}for(let i of[this.flagPoles,this.flagCrystals,this.flagRings])i.count=e,i.instanceMatrix.needsUpdate=!0;this.wrongMarks.count=t,this.wrongMarks.instanceMatrix.needsUpdate=!0,this.updateMineModels(),this.updateLabels()}placeSurface(e,t,i,n,r=1,a=null){this.dummy.position.copy(i.center).addScaledVector(i.normal,n*i.scale),this.dummy.quaternion.copy(i.rotation),a&&this.dummy.quaternion.multiply(a),this.dummy.scale.setScalar(i.scale*r),this.dummy.updateMatrix(),e.setMatrixAt(t,this.dummy.matrix)}updateLabels(){if(!this.labels||!this.cellFrames)return;this.camera.updateMatrixWorld();let e=this.camera.position.clone().sub(this.controls.target).normalize();this.visibleLabelIds=[],this.labels.forEach((t,i)=>{let n=this.labelMeshes[i],r=0;n.userData.cellIds=[];for(let a of t){let o=this.cellFrames[a];o.normal.dot(e)<.025||(this.dummy.position.copy(o.center).addScaledVector(o.normal,.016*o.scale),this.dummy.quaternion.copy(o.labelRotation),this.dummy.scale.setScalar(o.scale),this.dummy.updateMatrix(),n.setMatrixAt(r++,this.dummy.matrix),n.userData.cellIds.push(a),this.visibleLabelIds.push(a))}n.count=r,n.instanceMatrix.needsUpdate=!0})}updateMineModels(){let e=[];for(let t of this.presentation.cells){if(!t.revealed||!t.mine)continue;let i=this.cellFrames[t.id],n=i.center.clone().addScaledVector(i.normal,i.scale*.3);e.push({id:t.id,x:n.x,y:n.y,z:n.z,normal:i.normal.toArray(),scale:i.scale*.86,...this.detonation.stage(t.id)})}this.mines.update(e)}startSurfaceDetonation(e){let t=e.cells.find(r=>r.exploded)?.id;if(t===void 0)return;let i=new Float64Array(this.count).fill(1/0),n=new Uint8Array(this.count);i[t]=0;for(let r=0;r<this.count;r++){let a=-1,o=1/0;for(let l=0;l<this.count;l++)!n[l]&&i[l]<o&&(a=l,o=i[l]);if(a<0)break;n[a]=1;for(let l of this.surfaceCells[a].neighbors){let c=o+this.cellFrames[a].center.distanceTo(this.cellFrames[l].center);c<i[l]&&(i[l]=c)}}this.detonation.start({...e,cells:e.cells.map(r=>({...r,x:i[r.id],y:0}))})}advanceDetonation(e){if(!this.detonation.active)return;let t=this.detonation.advance(e);t.revealed.length&&(this.presentation=this.detonation.present(this.snapshot),this.drawTiles(),this.drawSymbols());for(let i of t.explosions){let n=this.cellFrames[i.id],r=n.center.clone().addScaledVector(n.normal,n.scale*.24);this.reducedMotion.matches||this.effects.flames.trigger({x:r.x,y:r.y,z:r.z,normal:n.normal.toArray(),scale:n.scale*.85});let a=r.project(this.camera);this.callbacks.onExplosion?.({index:i.index,total:this.detonation.entries.length,pan:Na.clamp(a.x,-.8,.8)})}this.updateMineModels(),t.finished&&this.callbacks.onChainComplete?.()}position(e){let t=this.cellFrames?.[e]?.center;return t?{x:t.x,y:t.y,z:t.z}:{x:0,y:0,z:0}}projectCell(e){let t=this.cellFrames?.[e];if(!t)return{x:NaN,y:NaN,visible:!1};this.camera.updateMatrixWorld();let i=t.center.clone().addScaledVector(t.normal,.018*t.scale).project(this.camera),n=this.renderer.domElement.getBoundingClientRect(),r=this.camera.position.clone().sub(this.controls.target).normalize(),a=n.left+(i.x+1)*n.width/2,o=n.top+(1-i.y)*n.height/2;return{x:a,y:o,visible:t.normal.dot(r)>.1&&Math.abs(i.x)<1&&Math.abs(i.y)<1&&Math.abs(i.z)<1&&this.pick({clientX:a,clientY:o})===e}}pick(e){if(!this.colliders)return-1;let t=this.renderer.domElement.getBoundingClientRect();if(!t.width||!t.height)return-1;this.pointer.set((e.clientX-t.left)/t.width*2-1,1-(e.clientY-t.top)/t.height*2),this.camera.updateMatrixWorld(),this.board.updateMatrixWorld(!0),this.raycaster.setFromCamera(this.pointer,this.camera);let i=this.raycaster.intersectObject(this.colliders,!1)[0];return!i||i.face.normal.dot(this.raycaster.ray.direction)>=0?-1:this.triangleCellIds[i.faceIndex]??-1}focus(e){if(!this.cellFrames?.[e])return;this.hoverId=-1,this.focusId=e;let t=this.cellFrames[e],i=this.projectCell(e),n=this.camera.position.clone().sub(this.controls.target).normalize();(!i.visible||t.normal.dot(n)<.42)&&this.setCameraDirection(t.normal,t.center),this.drawTiles(),this.updateLabels()}focusCell(e){this.focus(e)}setCameraDirection(e,t=new C){this.controls.stop(),this.controls.target.copy(t),this.camera.position.copy(e).normalize().multiplyScalar(Math.max(24,(this.radius||4.3)*4)).add(t);let i=this.camera.position.clone().sub(t).normalize();this.camera.up.copy(Math.abs(i.y)>.98?new C(0,0,-1):up).addScaledVector(i,-this.camera.up.dot(i)).normalize(),this.camera.lookAt(t),this.updateLabels()}resetCamera(e=!0){e&&(this.camera.zoom=1),this.setCameraDirection(this.topView?new C(0,1,.001):new C().fromArray(this.topology?.viewDirection||[1.25,.9,1.5])),this.resize(),this.refreshCursor()}setTopView(e){this.topView=!!e,this.controls.enableRotate=!0,this.resetCamera(!1)}resize(){let e=this.container.clientWidth,t=this.container.clientHeight;if(!e||!t)return;this.renderer.setSize(e,t),this.composer.setSize(e,t);let i=e/t,n=(this.radius||4.3)*1.22/Math.min(1,i);this.camera.left=-n*i,this.camera.right=n*i,this.camera.top=n,this.camera.bottom=-n,this.camera.updateProjectionMatrix()}bindEvents(){super.bindEvents(),this.releaseGuard=e=>{this.pointerState&&this.pointerState.id!==this.pick(e)&&(this.pointerState.cancelled=!0)},this.renderer.domElement.addEventListener("pointerup",this.releaseGuard,{capture:!0})}dispose(){this.disposed||(this.renderer.domElement.removeEventListener("pointerup",this.releaseGuard,{capture:!0}),super.dispose())}};function Qw(s){let e=Math.sin(s*127.1+311.7)*43758.5453;return e-Math.floor(e)}function e1(s){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d");t.font=`700 ${s>9?72:100}px ui-monospace, SFMono-Regular, Menlo, monospace`,t.textAlign="center",t.textBaseline="middle",t.fillStyle="#fff4db",t.fillText(String(s),64,69);let i=new mn(e);return i.colorSpace=zt,i}function H0({resolution:s=6,irregularity:e=.75,shape:t="stepped",seed:i=1}={}){if(!Number.isInteger(s)||s<4||s>12)throw new RangeError("Resolution must be an integer between 4 and 12");if(!Number.isFinite(e)||e<0||e>1)throw new RangeError("Irregularity must be a finite number between 0 and 1");if(!["cube","stepped","terrace"].includes(t))throw new RangeError("Shape must be cube, stepped, or terrace");if(!Number.isSafeInteger(i))throw new RangeError("Seed must be a safe integer");let n=s,r=s1(i),{floors:a,ceilings:o}=t1(n,e,t,r),l=G0[Math.floor(r()*G0.length)],c=[1.25,.9,1.5],h=Math.hypot(...c),d=l.axes.map((M,A)=>l.signs[A]*c[M]/h),u=new Uint8Array(n**3),f=(M,A,x)=>M+n*(A+n*x);for(let M=0;M<n;M+=1)for(let A=0;A<n;A+=1)for(let x=a[A+n*M];x<o[A+n*M];x+=1){let T=[A,x,M],R=l.axes.map((I,U)=>l.signs[U]>0?T[I]:n-1-T[I]);u[f(...R)]=1}let p=(M,A,x)=>M>=0&&M<n&&A>=0&&A<n&&x>=0&&x<n&&u[f(M,A,x)]===1,_=new Array(6*n*n),g=new Map,m=new Map,y=0,w=M=>{let A=M.join(",");if(!g.has(A)){let x=M.map(T=>T-n/2);g.set(A,x),y=Math.max(y,Math.hypot(...x))}return g.get(A)};for(let M=0;M<n;M+=1)for(let A=0;A<n;A+=1)for(let x=0;x<n;x+=1)if(p(x,A,M))for(let T=0;T<V0.length;T+=1){let R=V0[T];if(p(x+R[0],A+R[1],M+R[2]))continue;let{u:I,v:U,corners:O}=n1(T,x,A,M,n),D=T*n*n+U*n+I;if(_[D])throw new Error("Surface direction atlas contains an overlapping tile");let B=O.map(w),X=B[0].map((k,ne)=>(k+B[2][ne])/2);_[D]={id:D,x:I,y:T*n+U,face:T,u:I,v:U,center:X,normal:[...R],corners:B,patch:[B[0],B[1],B[3],B[2]],patchSize:2,neighbors:[]};for(let k of O){let ne=k.join(",");m.has(ne)||m.set(ne,[]),m.get(ne).push(D)}}if(_.includes(void 0))throw new Error("Surface direction atlas contains a missing tile");let v=_.map(()=>new Set);for(let M of m.values())for(let A of M)for(let x of M)x!==A&&v[A].add(x);let b=0;for(let M of _)M.neighbors=[...v[M.id]].sort((A,x)=>A-x),b=Math.max(b,M.neighbors.length);return W0({kind:"surface",resolution:s,width:n,height:6*n,cellCount:_.length,shape:t,seed:i,irregularity:e,radius:y,surfaceArea:_.length,patchSize:2,maxDegree:b,viewDirection:d,cells:_})}function t1(s,e,t,i){let n=new Uint8Array(s*s),r=new Uint8Array(s*s).fill(s),a={floors:n,ceilings:r};if(t==="cube"||e===0)return a;let o=Math.floor((s-1)/2),l=s-o-1,c=Math.max(1,Math.round(e*(s-1))),h=(d,u,f)=>{let p=d[0]>0?l:o,_=d[2]>0?l:o,g=i1(u,f,t,i,p,_);for(let m of g)for(let y=0;y<m.length;y+=1)for(let w=0;w<m.width;w+=1){let v=d[0]>0?s-1-w:w,b=d[2]>0?s-1-y:y,M=v+s*b;d[1]>0?r[M]-=m.depth:n[M]+=m.depth}};if(h([1,1,1],c,e),h([-1,-1,-1],c,e),e>=.85){let d=Math.min(1,(e-.85)/.15),u=Math.min(c-1,1+Math.floor(d*2+1e-9));h([-1,1,1],u,d),h([1,-1,-1],u,d)}return a}function i1(s,e,t,i,n,r){let a=Math.min(n,r),o=t==="stepped"?Math.min(s,a,i()<.6?1:2):Math.min(s,a),l=u=>Math.min(u,Math.max(u>=2&&e>=.25?2:1,Math.round(u*(.55+e*.4)+(i()-.5)*Math.min(2,u*.4)))),c=l(n),h=l(r),d=[];for(let u=0;u<o;u+=1)d.push({width:c-Math.floor(u*c/o),length:h-Math.floor(u*h/o),depth:Math.floor(s/o)+(u<s%o?1:0)});return d}function n1(s,e,t,i,n){switch(s){case 0:return{u:n-1-i,v:t,corners:[[e+1,t,i+1],[e+1,t,i],[e+1,t+1,i],[e+1,t+1,i+1]]};case 1:return{u:i,v:t,corners:[[e,t,i],[e,t,i+1],[e,t+1,i+1],[e,t+1,i]]};case 2:return{u:e,v:n-1-i,corners:[[e,t+1,i+1],[e+1,t+1,i+1],[e+1,t+1,i],[e,t+1,i]]};case 3:return{u:e,v:i,corners:[[e,t,i],[e+1,t,i],[e+1,t,i+1],[e,t,i+1]]};case 4:return{u:e,v:t,corners:[[e,t,i+1],[e+1,t,i+1],[e+1,t+1,i+1],[e,t+1,i+1]]};default:return{u:n-1-e,v:t,corners:[[e+1,t,i],[e,t,i],[e,t+1,i],[e+1,t+1,i]]}}}function s1(s){let e=(s^Math.floor(s/4294967296)^2654435769)>>>0;return()=>{e=e+1831565813>>>0;let t=Math.imul(e^e>>>15,e|1);return t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function W0(s){if(s&&typeof s=="object"&&!Object.isFrozen(s)){for(let e of Object.values(s))W0(e);Object.freeze(s)}return s}var V0=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],G0=[{axes:[0,1,2],signs:[1,1,1]},{axes:[2,1,0],signs:[1,1,-1]},{axes:[0,1,2],signs:[-1,1,-1]},{axes:[2,1,0],signs:[-1,1,1]}];var Ku={"ui.page_title":"VOID SURVEY \xB7 3D Minesweeper","ui.brand_caption":"3D MINESWEEPER","ui.brand_home":"VOID SURVEY home","ui.header_expedition":"DEEP-SPACE EXPEDITION","ui.header_unseen":"EXPLORE THE UNSEEN","ui.game_settings":"Game settings","ui.language":"Language","ui.open_guide":"Open guide","ui.how_to_play":"How to play","ui.survey_settings":"Survey settings","ui.mission_status":"Survey mission and status","ui.expedition":"THE EXPEDITION","ui.survey_area":"Survey area","ui.field_type":"Field type","ui.world_tag":"WORLD","ui.carved_cube":"Carved cube","ui.planar_ruin":"Planar ruin","ui.sector_tag":"SECTOR","ui.preset_scout":"Scout \xB7 9\xD79 \xB7 10","ui.preset_deep":"Deep \xB7 16\xD716 \xB7 40","ui.preset_frontier":"Frontier \xB7 30\xD716 \xB7 99","ui.preset_custom":"Custom sector","ui.width":"Width","ui.height":"Height","ui.cores":"Cores","ui.custom_start":"Start custom survey","ui.recess_depth":"Recess depth","ui.more_settings":"More settings","ui.cut_style":"Cut style","ui.form_tag":"FORM","ui.stepped_cuts":"Stepped cuts","ui.terraces":"Terraces","ui.regular_cube":"Regular cube","ui.tile_count":"Tile count","ui.tile_count_hint":"More tiles. The same square size.","ui.core_density":"Core density","ui.generate_cube":"Generate cube","ui.survey_data":"Survey data","ui.cores_left":"Cores left","ui.cores_tag":"CORES","ui.elapsed":"Elapsed","ui.time_tag":"TIME","ui.survey_progress":"Survey progress","ui.safe_tiles":"Safe tiles","ui.mission_report":"MISSION REPORT","ui.new_survey":"New survey","ui.rail_note":"Find the pattern in the unknown.","ui.minefield":"3D minefield","ui.fallback_board":"Minesweeper board","ui.preparing":"Preparing the survey","ui.drag_orbit":"Drag to orbit","ui.scroll_zoom":"Scroll to zoom","ui.pinch_zoom":"Pinch to zoom","ui.footer_note":"Observe. Then explore.","ui.survey_controls":"Survey controls","ui.primary_action":"Primary action","ui.explore":"Explore","ui.mark":"Mark","ui.camera_controls":"Camera controls","ui.reset_view":"Reset view","ui.reset":"Reset","ui.toggle_top_view":"Toggle top view \xB7 V","ui.top_view":"Top view","ui.field_manual":"FIELD MANUAL","ui.close_guide":"Close guide","ui.help_title":"Let the numbers guide you.","ui.help_intro":"Explore every safe tile to complete the survey. Each number counts dangerous cores in neighboring tiles that share an edge or corner. Mark the tiles you suspect. Music starts after your first interaction; the top-right controls let you mute music and sound effects separately.","ui.help_cube":"The default Carved cube opens with 216 tiles, 30 cores, and 75% recess depth. Every tile is an equal-sized square, and numbers sit flat on its face. Adjust Recess depth to change the stepped silhouette. More settings contains Cut style, Tile count, and Core density. Generate cube applies your choices. At 85% depth, two additional corner recesses begin to open. Tiles sharing an edge or corner are neighbors, including across ridges and inside corners. Hover or focus a tile to see its full neighborhood. Rotate to reach the back; every side counts toward completion.","ui.help_actions_title":"Explore / Mark","ui.help_actions":"Click to explore. Right-click or press and hold to mark. On touch screens, you can also switch to Mark in the toolbar.","ui.help_chord_title":"Open nearby tiles","ui.help_chord":"When the nearby marks match a tile\u2019s number, double-click it to explore the remaining neighbors. Incorrect marks can still trigger a core.","ui.help_camera_title":"Look around","ui.help_camera":"Drag to orbit; scroll or pinch to zoom. Use Top view to see the layout, or Reset to restore the starting view.","ui.help_keyboard_title":"Keyboard controls","ui.arrow_keys":"Arrow keys","ui.keyboard_select":"select a tile;","ui.keyboard_explore":"explore;","ui.keyboard_mark":"marks;","ui.keyboard_top_view":"toggles top view;","ui.keyboard_restart":"starts a new survey, with confirmation during an active round.","ui.start_exploring":"Start exploring","ui.mission_control":"MISSION CONTROL","ui.keep_exploring":"Keep exploring","game.surface.current":"Current: {depth}% depth \xB7 {count} tiles \xB7 {mines} cores","game.surface.summary":"{count} tiles \xB7 {mines} cores","game.surface.seed":"Shape seed: {seed}","game.field.surface":"Carved cube","game.field.plane":"Planar ruin","game.hint.surface":"Drag to explore every side","game.hint.orbit":"Drag to orbit \xB7 Scroll to zoom","game.intro.surface.first":"Beyond the flat.","game.intro.surface.second":"Into the corners.","game.intro.surface.lead":"A cube carved for discovery.","game.intro.surface.detail":"Follow the clues into every recess.","game.intro.plane.first":"Chart the ","game.intro.plane.second":"unknown.","game.intro.plane.lead":"A dormant relic.","game.intro.plane.detail":"Every number points to safety.","game.aria.stage.surface":"Faceted minesweeper solid. Drag to orbit every side. Arrow keys follow neighboring tiles; Enter explores; F marks.","game.aria.stage.plane":"3D minesweeper board. Arrow keys select; Enter explores; F marks; V toggles top view.","game.surface.tiles":"{count} tiles","game.off":"Off","game.percent":"{value}%","game.relief.regular":"Choose a carved style in More settings to add recesses.","game.relief.zero":"No recesses. Increase depth to carve the corners.","game.relief.deep":"Deep main cuts with extra recesses at other corners.","game.relief.opposite":"Deepen opposite corners. Every tile stays the same size.","game.relief.off":"Off for regular cube","game.relief.value":"{depth} percent recess depth","game.surface.density":"{density}% \xB7 {mines} cores","game.draft.apply":"Generate to apply draft.","game.draft.ready":"New cube ready.","game.draft.initial":"Ready to explore.","game.choose":"Choose a tile to begin","game.mark_guard":"Explore a tile before marking suspected cores.","game.chain.title":"Chain reaction","game.chain.description":"The blast is spreading. Cores will detonate one by one.","game.status.ready.title":"Ready to explore","game.status.ready.description":"Choose any tile. Your first move and its neighbors are safe.","game.status.ready.surface.description":"Choose any tile. Hover to see its neighbors; drag to explore every side.","game.status.playing.title":"Survey in progress","game.status.playing.description":"Numbers count cores in the eight neighboring tiles. Mark suspected cores.","game.status.playing.surface.description":"Numbers count cores in touching tiles across the surface. Rotate to explore every side.","game.status.won.title":"Sector cleared","game.status.won.description":"All safe tiles explored. Every core is marked.","game.status.lost.title":"Core triggered","game.status.lost.description":"Review the revealed cores, then start a new survey.","game.surface.size":"{count} surface tiles","game.plane.size":"{width} \xD7 {height}","game.mines":"{mines} cores","game.result.won.title":"Silence restored.","game.result.lost.title":"Survey interrupted.","game.result.won.description":"All {count} safe tiles explored in {time}.","game.result.lost.description":"{count} safe tiles explored in {time}. All core locations are now visible.","game.result.won.toast":"Survey complete \xB7 all safe tiles explored","game.result.lost.toast":"Core triggered \xB7 full layout revealed","game.cell.wrong":"Incorrect mark","game.cell.mine":"Unstable core","game.cell.safe":"Safe tile","game.cell.nearby_one":"{count} nearby core","game.cell.nearby_other":"{count} nearby cores","game.cell.marked":"Marked","game.cell.covered":"Unexplored","game.readout.surface":"Tile {id} / {label} \xB7 {neighbors} neighbors","game.readout.plane":"{x} : {y} / {label}","game.aria.board.surface":"Faceted minesweeper solid. Arrow keys follow touching tiles across faces. Enter explores and F marks.","game.aria.board.plane":"Minesweeper grid. Use the arrow keys to select a tile, Enter to explore, and F to mark.","game.face.right":"Right","game.face.left":"Left","game.face.up":"Up","game.face.down":"Down","game.face.front":"Front","game.face.back":"Back","game.face.heading":"{face}-facing tiles","game.aria.cell.surface":"{face}-facing tile {id}: {description}. Neighbors {neighbors}.","game.aria.cell.plane":"Row {row}, column {column}: {description}","game.fallback.surface":"3D unavailable \xB7 Direction atlas enabled. Neighbors still connect across faces.","game.fallback.plane":"3D unavailable \xB7 The grid is ready to play.","game.confirm.title":"Start a new survey?","game.confirm.restart":"This will reset the board, marks, and timer.","game.confirm.preset":"Changing sectors will reset your current survey.","game.confirm.custom":"Applying these settings will reset your current survey.","game.confirm.mode":"Changing the field type will start a new survey.","game.confirm.generate":"Generating a new solid will reset this survey, marks, and timer.","game.audio.sound.mute":"Mute sound effects","game.audio.sound.unmute":"Unmute sound effects","game.audio.music.mute":"Mute music","game.audio.music.unmute":"Unmute music","game.audio.on":"Sound on","game.audio.off":"Sound off","game.error.width":"Width must be an integer between 5 and 50","game.error.height":"Height must be an integer between 5 and 30","game.error.mines":"Mines must be an integer between 1 and width \xD7 height \u2212 9.","game.error.generic":"Unable to apply these settings. Please try again."};var X0={"ui.page_title":"VOID SURVEY \xB7 3D \u626B\u96F7","ui.brand_caption":"3D \u626B\u96F7","ui.brand_home":"VOID SURVEY \u9996\u9875","ui.header_expedition":"\u6DF1\u7A7A\u63A2\u7D22","ui.header_unseen":"\u63A2\u7D22\u672A\u77E5","ui.game_settings":"\u6E38\u620F\u8BBE\u7F6E","ui.language":"\u8BED\u8A00","ui.open_guide":"\u6253\u5F00\u73A9\u6CD5\u6307\u5357","ui.how_to_play":"\u73A9\u6CD5\u8BF4\u660E","ui.survey_settings":"\u63A2\u7D22\u8BBE\u7F6E","ui.mission_status":"\u63A2\u7D22\u4EFB\u52A1\u4E0E\u72B6\u6001","ui.expedition":"\u63A2\u7D22\u4EFB\u52A1","ui.survey_area":"\u63A2\u7D22\u533A\u57DF","ui.field_type":"\u68CB\u76D8\u7C7B\u578B","ui.world_tag":"\u5F62\u6001","ui.carved_cube":"\u51F9\u9677\u7ACB\u65B9\u4F53","ui.planar_ruin":"\u5E73\u9762\u9057\u8FF9","ui.sector_tag":"\u533A\u57DF","ui.preset_scout":"\u4FA6\u5BDF \xB7 9\xD79 \xB7 10 \u96F7","ui.preset_deep":"\u6DF1\u5165 \xB7 16\xD716 \xB7 40 \u96F7","ui.preset_frontier":"\u524D\u6CBF \xB7 30\xD716 \xB7 99 \u96F7","ui.preset_custom":"\u81EA\u5B9A\u4E49\u533A\u57DF","ui.width":"\u5BBD\u5EA6","ui.height":"\u9AD8\u5EA6","ui.cores":"\u5730\u96F7\u6570","ui.custom_start":"\u5F00\u59CB\u81EA\u5B9A\u4E49\u63A2\u7D22","ui.recess_depth":"\u51F9\u9677\u6DF1\u5EA6","ui.more_settings":"\u66F4\u591A\u8BBE\u7F6E","ui.cut_style":"\u51F9\u9677\u6837\u5F0F","ui.form_tag":"\u5F62\u72B6","ui.stepped_cuts":"\u9636\u68AF\u51F9\u9677","ui.terraces":"\u5C42\u53E0\u53F0\u9636","ui.regular_cube":"\u89C4\u5219\u7ACB\u65B9\u4F53","ui.tile_count":"\u683C\u5B50\u6570\u91CF","ui.tile_count_hint":"\u589E\u52A0\u683C\u5B50\u6570\u91CF\uFF0C\u5355\u683C\u5927\u5C0F\u4FDD\u6301\u4E0D\u53D8\u3002","ui.core_density":"\u5730\u96F7\u5BC6\u5EA6","ui.generate_cube":"\u751F\u6210\u7ACB\u65B9\u4F53","ui.survey_data":"\u63A2\u7D22\u6570\u636E","ui.cores_left":"\u5269\u4F59\u5730\u96F7","ui.cores_tag":"\u5730\u96F7","ui.elapsed":"\u7528\u65F6","ui.time_tag":"\u65F6\u95F4","ui.survey_progress":"\u63A2\u7D22\u8FDB\u5EA6","ui.safe_tiles":"\u5B89\u5168\u683C","ui.mission_report":"\u63A2\u7D22\u62A5\u544A","ui.new_survey":"\u91CD\u65B0\u5F00\u59CB","ui.rail_note":"\u5728\u672A\u77E5\u4E2D\u5BFB\u627E\u89C4\u5F8B\u3002","ui.minefield":"3D \u626B\u96F7\u533A\u57DF","ui.fallback_board":"\u626B\u96F7\u68CB\u76D8","ui.preparing":"\u6B63\u5728\u51C6\u5907\u68CB\u76D8","ui.drag_orbit":"\u62D6\u52A8\u65CB\u8F6C","ui.scroll_zoom":"\u6EDA\u8F6E\u7F29\u653E","ui.pinch_zoom":"\u53CC\u6307\u7F29\u653E","ui.footer_note":"\u5148\u89C2\u5BDF\uFF0C\u518D\u63A2\u7D22\u3002","ui.survey_controls":"\u63A2\u7D22\u64CD\u4F5C","ui.primary_action":"\u4E3B\u8981\u64CD\u4F5C","ui.explore":"\u63A2\u7D22","ui.mark":"\u6807\u8BB0","ui.camera_controls":"\u89C6\u89D2\u63A7\u5236","ui.reset_view":"\u91CD\u7F6E\u89C6\u89D2","ui.reset":"\u91CD\u7F6E","ui.toggle_top_view":"\u5207\u6362\u4FEF\u89C6 \xB7 V","ui.top_view":"\u4FEF\u89C6","ui.field_manual":"\u63A2\u7D22\u624B\u518C","ui.close_guide":"\u5173\u95ED\u73A9\u6CD5\u6307\u5357","ui.help_title":"\u8BA9\u6570\u5B57\u6307\u5F15\u65B9\u5411\u3002","ui.help_intro":"\u7FFB\u5F00\u6240\u6709\u5B89\u5168\u683C\u5373\u53EF\u5B8C\u6210\u63A2\u7D22\u3002\u6BCF\u4E2A\u6570\u5B57\u8868\u793A\u4E0E\u8BE5\u683C\u5171\u8FB9\u6216\u5171\u89D2\u7684\u76F8\u90BB\u683C\u4E2D\u6709\u591A\u5C11\u9897\u5730\u96F7\u3002\u53EF\u4EE5\u6807\u8BB0\u4F60\u6000\u7591\u85CF\u96F7\u7684\u683C\u5B50\u3002\u9996\u6B21\u64CD\u4F5C\u540E\u5F00\u59CB\u64AD\u653E\u97F3\u4E50\uFF1B\u53F3\u4E0A\u89D2\u53EF\u5206\u522B\u5173\u95ED\u80CC\u666F\u97F3\u4E50\u548C\u97F3\u6548\u3002","ui.help_cube":"\u9ED8\u8BA4\u51F9\u9677\u7ACB\u65B9\u4F53\u6709 216 \u683C\u300130 \u9897\u5730\u96F7\uFF0C\u51F9\u9677\u6DF1\u5EA6\u4E3A 75%\u3002\u6240\u6709\u683C\u5B50\u90FD\u662F\u7B49\u5927\u7684\u6B63\u65B9\u5F62\uFF0C\u6570\u5B57\u8D34\u5728\u683C\u9762\u4E0A\u3002\u8C03\u6574\u201C\u51F9\u9677\u6DF1\u5EA6\u201D\u53EF\u6539\u53D8\u9636\u68AF\u8F6E\u5ED3\uFF1B\u201C\u66F4\u591A\u8BBE\u7F6E\u201D\u4E2D\u53EF\u8C03\u6574\u51F9\u9677\u6837\u5F0F\u3001\u683C\u5B50\u6570\u91CF\u548C\u5730\u96F7\u5BC6\u5EA6\uFF0C\u70B9\u51FB\u201C\u751F\u6210\u7ACB\u65B9\u4F53\u201D\u5E94\u7528\u8BBE\u7F6E\u3002\u6DF1\u5EA6\u8FBE\u5230 85% \u65F6\uFF0C\u53E6\u5916\u4E24\u4E2A\u89D2\u5F00\u59CB\u51F9\u5165\u3002\u5171\u8FB9\u6216\u5171\u89D2\u7684\u683C\u5B50\u4E92\u4E3A\u90BB\u683C\uFF0C\u5305\u62EC\u8DE8\u68F1\u8FB9\u548C\u51F9\u89D2\u76F8\u63A5\u7684\u683C\u5B50\u3002\u60AC\u505C\u6216\u7528\u952E\u76D8\u9009\u4E2D\u683C\u5B50\uFF0C\u53EF\u67E5\u770B\u5B8C\u6574\u7684\u76F8\u90BB\u8303\u56F4\u3002\u65CB\u8F6C\u67E5\u770B\u80CC\u9762\uFF1B\u6240\u6709\u9762\u90FD\u9700\u8981\u63A2\u7D22\u3002","ui.help_actions_title":"\u63A2\u7D22 / \u6807\u8BB0","ui.help_actions":"\u70B9\u51FB\u63A2\u7D22\uFF1B\u53F3\u952E\u6216\u957F\u6309\u6807\u8BB0\u3002\u4F7F\u7528\u89E6\u6478\u5C4F\u65F6\uFF0C\u4E5F\u53EF\u4EE5\u5728\u5DE5\u5177\u680F\u5207\u6362\u5230\u201C\u6807\u8BB0\u201D\u3002","ui.help_chord_title":"\u8FDE\u5F00\u76F8\u90BB\u683C","ui.help_chord":"\u76F8\u90BB\u6807\u8BB0\u6570\u4E0E\u683C\u5185\u6570\u5B57\u76F8\u7B49\u65F6\uFF0C\u53CC\u51FB\u8BE5\u6570\u5B57\u5373\u53EF\u7FFB\u5F00\u5176\u4F59\u90BB\u683C\u3002\u6807\u8BB0\u6709\u8BEF\u4ECD\u53EF\u80FD\u89E6\u96F7\u3002","ui.help_camera_title":"\u67E5\u770B\u56DB\u5468","ui.help_camera":"\u62D6\u52A8\u65CB\u8F6C\uFF0C\u6EDA\u8F6E\u6216\u53CC\u6307\u7F29\u653E\u3002\u70B9\u51FB\u201C\u4FEF\u89C6\u201D\u67E5\u770B\u5E03\u5C40\uFF0C\u70B9\u51FB\u201C\u91CD\u7F6E\u201D\u6062\u590D\u521D\u59CB\u89C6\u89D2\u3002","ui.help_keyboard_title":"\u952E\u76D8\u64CD\u4F5C","ui.arrow_keys":"\u65B9\u5411\u952E","ui.keyboard_select":"\u9009\u62E9\u683C\u5B50\uFF1B","ui.keyboard_explore":"\u63A2\u7D22\uFF1B","ui.keyboard_mark":"\u6807\u8BB0\uFF1B","ui.keyboard_top_view":"\u5207\u6362\u4FEF\u89C6\uFF1B","ui.keyboard_restart":"\u91CD\u65B0\u5F00\u59CB\uFF0C\u8FDB\u884C\u4E2D\u7684\u68CB\u5C40\u4F1A\u5148\u8981\u6C42\u786E\u8BA4\u3002","ui.start_exploring":"\u5F00\u59CB\u63A2\u7D22","ui.mission_control":"\u4EFB\u52A1\u63A7\u5236","ui.keep_exploring":"\u7EE7\u7EED\u63A2\u7D22","game.surface.current":"\u5F53\u524D\uFF1A\u51F9\u9677 {depth}% \xB7 {count} \u683C \xB7 {mines} \u9897\u96F7","game.surface.summary":"{count} \u683C \xB7 {mines} \u9897\u96F7","game.surface.seed":"\u5F62\u72B6\u79CD\u5B50\uFF1A{seed}","game.field.surface":"\u51F9\u9677\u7ACB\u65B9\u4F53","game.field.plane":"\u5E73\u9762\u9057\u8FF9","game.hint.surface":"\u62D6\u52A8\u65CB\u8F6C\uFF0C\u63A2\u7D22\u6BCF\u4E00\u9762","game.hint.orbit":"\u62D6\u52A8\u65CB\u8F6C \xB7 \u6EDA\u8F6E\u7F29\u653E","game.intro.surface.first":"\u6DF1\u5165\u7ACB\u4F53\uFF0C","game.intro.surface.second":"\u63A2\u7D22\u6BCF\u4E2A\u51F9\u89D2\u3002","game.intro.surface.lead":"\u5728\u51F9\u9677\u7ACB\u65B9\u4F53\u4E0A\u5BFB\u627E\u5B89\u5168\u8DEF\u5F84\u3002","game.intro.surface.detail":"\u987A\u7740\u6570\u5B57\uFF0C\u63A2\u7D22\u6BCF\u4E00\u5904\u51F9\u89D2\u3002","game.intro.plane.first":"\u63A2\u7D22","game.intro.plane.second":"\u672A\u77E5\u3002","game.intro.plane.lead":"\u4E00\u7247\u6C89\u7761\u7684\u9057\u8FF9\u3002","game.intro.plane.detail":"\u6BCF\u4E2A\u6570\u5B57\u90FD\u6307\u5411\u5B89\u5168\u7684\u65B9\u5411\u3002","game.aria.stage.surface":"\u7ACB\u4F53\u626B\u96F7\u3002\u62D6\u52A8\u67E5\u770B\u5404\u9762\uFF1B\u65B9\u5411\u952E\u9009\u62E9\u76F8\u90BB\u683C\uFF0CEnter \u63A2\u7D22\uFF0CF \u6807\u8BB0\u3002","game.aria.stage.plane":"\u5E73\u9762\u626B\u96F7\u3002\u65B9\u5411\u952E\u9009\u62E9\u683C\u5B50\uFF0CEnter \u63A2\u7D22\uFF0CF \u6807\u8BB0\uFF0CV \u5207\u6362\u4FEF\u89C6\u3002","game.surface.tiles":"{count} \u683C","game.off":"\u5173\u95ED","game.percent":"{value}%","game.relief.regular":"\u5728\u66F4\u591A\u8BBE\u7F6E\u4E2D\u9009\u62E9\u51F9\u9677\u6837\u5F0F\uFF0C\u5373\u53EF\u8C03\u8282\u6DF1\u5EA6\u3002","game.relief.zero":"\u5F53\u524D\u6CA1\u6709\u51F9\u9677\u3002\u63D0\u9AD8\u6DF1\u5EA6\u5373\u53EF\u5207\u5165\u89D2\u843D\u3002","game.relief.deep":"\u4E3B\u89D2\u6DF1\u5207\uFF0C\u53E6\u5916\u4E24\u4E2A\u89D2\u4E5F\u5F00\u59CB\u51F9\u5165\u3002","game.relief.opposite":"\u52A0\u6DF1\u5BF9\u89D2\u51F9\u9677\uFF0C\u4FDD\u6301\u6BCF\u4E2A\u65B9\u683C\u7B49\u5927\u3002","game.relief.off":"\u89C4\u5219\u7ACB\u65B9\u4F53\u4E0D\u4F7F\u7528\u51F9\u9677","game.relief.value":"\u51F9\u9677\u6DF1\u5EA6 {depth}%","game.surface.density":"{density}% \xB7 {mines} \u9897\u96F7","game.draft.apply":"\u751F\u6210\u540E\u5E94\u7528\u65B0\u53C2\u6570\u3002","game.draft.ready":"\u65B0\u7ACB\u65B9\u4F53\u5DF2\u5C31\u7EEA\u3002","game.draft.initial":"\u53EF\u4EE5\u5F00\u59CB\u63A2\u7D22\u3002","game.choose":"\u9009\u62E9\u4E00\u4E2A\u683C\u5B50\uFF0C\u5F00\u59CB\u63A2\u7D22","game.mark_guard":"\u5148\u63A2\u7D22\u4E00\u4E2A\u683C\u5B50\uFF0C\u518D\u6807\u8BB0\u7591\u4F3C\u5730\u96F7\u3002","game.chain.title":"\u8FDE\u9501\u7206\u70B8","game.chain.description":"\u7206\u70B8\u6B63\u5728\u6269\u6563\uFF0C\u5730\u96F7\u5C06\u4F9D\u6B21\u5F15\u7206\u3002","game.status.ready.title":"\u51C6\u5907\u63A2\u7D22","game.status.ready.description":"\u4EFB\u9009\u4E00\u683C\u5F00\u59CB\uFF0C\u9996\u683C\u53CA\u5176\u76F8\u90BB\u683C\u90FD\u5B89\u5168\u3002","game.status.ready.surface.description":"\u4EFB\u9009\u4E00\u683C\u5F00\u59CB\u3002\u60AC\u505C\u67E5\u770B\u90BB\u683C\uFF0C\u62D6\u52A8\u63A2\u7D22\u5404\u9762\u3002","game.status.playing.title":"\u63A2\u7D22\u4E2D","game.status.playing.description":"\u6570\u5B57\u8868\u793A\u5468\u56F4\u516B\u683C\u7684\u5730\u96F7\u6570\u3002\u53EF\u6807\u8BB0\u7591\u4F3C\u5730\u96F7\u3002","game.status.playing.surface.description":"\u6570\u5B57\u8868\u793A\u76F8\u90BB\u683C\u4E2D\u7684\u5730\u96F7\u6570\u3002\u65CB\u8F6C\u67E5\u770B\u5404\u9762\u3002","game.status.won.title":"\u63A2\u7D22\u5B8C\u6210","game.status.won.description":"\u6240\u6709\u5B89\u5168\u683C\u5DF2\u63A2\u7D22\uFF0C\u5730\u96F7\u5DF2\u5168\u90E8\u6807\u8BB0\u3002","game.status.lost.title":"\u89E6\u53D1\u5730\u96F7","game.status.lost.description":"\u67E5\u770B\u5DF2\u63ED\u793A\u7684\u5730\u96F7\uFF0C\u51C6\u5907\u4E0B\u4E00\u6B21\u63A2\u7D22\u3002","game.surface.size":"{count} \u4E2A\u8868\u9762\u683C","game.plane.size":"{width} \xD7 {height}","game.mines":"{mines} \u9897\u96F7","game.result.won.title":"\u91CD\u5F52\u5B81\u9759\u3002","game.result.lost.title":"\u63A2\u7D22\u4E2D\u65AD\u3002","game.result.won.description":"\u7528\u65F6 {time}\uFF0C\u5DF2\u63A2\u7D22\u5168\u90E8 {count} \u4E2A\u5B89\u5168\u683C\u3002","game.result.lost.description":"\u7528\u65F6 {time}\uFF0C\u5DF2\u63A2\u7D22 {count} \u4E2A\u5B89\u5168\u683C\u3002\u6240\u6709\u5730\u96F7\u4F4D\u7F6E\u5DF2\u63ED\u793A\u3002","game.result.won.toast":"\u63A2\u7D22\u5B8C\u6210 \xB7 \u6240\u6709\u5B89\u5168\u683C\u5DF2\u5F00\u542F","game.result.lost.toast":"\u89E6\u53D1\u5730\u96F7 \xB7 \u5168\u90E8\u4F4D\u7F6E\u5DF2\u63ED\u793A","game.cell.wrong":"\u9519\u8BEF\u6807\u8BB0","game.cell.mine":"\u5730\u96F7","game.cell.safe":"\u5B89\u5168\u683C","game.cell.nearby_one":"\u9644\u8FD1\u6709 {count} \u9897\u96F7","game.cell.nearby_other":"\u9644\u8FD1\u6709 {count} \u9897\u96F7","game.cell.marked":"\u5DF2\u6807\u8BB0","game.cell.covered":"\u672A\u63A2\u7D22","game.readout.surface":"\u7B2C {id} \u683C / {label} \xB7 {neighbors} \u4E2A\u90BB\u683C","game.readout.plane":"{x} : {y} / {label}","game.aria.board.surface":"\u7ACB\u4F53\u626B\u96F7\u3002\u65B9\u5411\u952E\u8DE8\u9762\u9009\u62E9\u76F8\u90BB\u683C\uFF0CEnter \u63A2\u7D22\uFF0CF \u6807\u8BB0\u3002","game.aria.board.plane":"\u626B\u96F7\u68CB\u76D8\u3002\u65B9\u5411\u952E\u9009\u62E9\u683C\u5B50\uFF0CEnter \u63A2\u7D22\uFF0CF \u6807\u8BB0\u3002","game.face.right":"\u53F3","game.face.left":"\u5DE6","game.face.up":"\u4E0A","game.face.down":"\u4E0B","game.face.front":"\u524D","game.face.back":"\u540E","game.face.heading":"\u671D{face}\u7684\u683C\u5B50","game.aria.cell.surface":"\u671D{face}\u7684\u7B2C {id} \u683C\uFF1A{description}\u3002\u76F8\u90BB\u683C\uFF1A{neighbors}\u3002","game.aria.cell.plane":"\u7B2C {row} \u884C\uFF0C\u7B2C {column} \u5217\uFF1A{description}","game.fallback.surface":"3D \u4E0D\u53EF\u7528 \xB7 \u5DF2\u542F\u7528\u65B9\u5411\u5C55\u5F00\u56FE\uFF0C\u90BB\u683C\u4ECD\u8DE8\u9762\u8FDE\u63A5\u3002","game.fallback.plane":"3D \u4E0D\u53EF\u7528 \xB7 \u53EF\u4EE5\u5728\u517C\u5BB9\u68CB\u76D8\u4E0A\u7EE7\u7EED\u6E38\u620F\u3002","game.confirm.title":"\u5F00\u59CB\u65B0\u7684\u63A2\u7D22\uFF1F","game.confirm.restart":"\u8FD9\u5C06\u91CD\u7F6E\u68CB\u76D8\u3001\u6807\u8BB0\u548C\u8BA1\u65F6\u3002","game.confirm.preset":"\u5207\u6362\u96BE\u5EA6\u5C06\u91CD\u65B0\u5F00\u59CB\u5F53\u524D\u63A2\u7D22\u3002","game.confirm.custom":"\u5E94\u7528\u8FD9\u4E9B\u8BBE\u7F6E\u5C06\u91CD\u65B0\u5F00\u59CB\u5F53\u524D\u63A2\u7D22\u3002","game.confirm.mode":"\u5207\u6362\u68CB\u76D8\u6A21\u5F0F\u5C06\u5F00\u59CB\u65B0\u7684\u63A2\u7D22\u3002","game.confirm.generate":"\u751F\u6210\u65B0\u7ACB\u65B9\u4F53\u5C06\u91CD\u7F6E\u68CB\u76D8\u3001\u6807\u8BB0\u548C\u8BA1\u65F6\u3002","game.audio.sound.mute":"\u5173\u95ED\u97F3\u6548","game.audio.sound.unmute":"\u5F00\u542F\u97F3\u6548","game.audio.music.mute":"\u5173\u95ED\u97F3\u4E50","game.audio.music.unmute":"\u5F00\u542F\u97F3\u4E50","game.audio.on":"\u97F3\u6548\u5F00\u542F","game.audio.off":"\u97F3\u6548\u5173\u95ED","game.error.width":"\u5BBD\u5EA6\u987B\u4E3A 5 \u5230 50 \u4E4B\u95F4\u7684\u6574\u6570\u3002","game.error.height":"\u9AD8\u5EA6\u987B\u4E3A 5 \u5230 30 \u4E4B\u95F4\u7684\u6574\u6570\u3002","game.error.mines":"\u5730\u96F7\u6570\u987B\u4E3A 1 \u5230\u201C\u5BBD\u5EA6 \xD7 \u9AD8\u5EA6 \u2212 9\u201D\u4E4B\u95F4\u7684\u6574\u6570\u3002","game.error.generic":"\u65E0\u6CD5\u5E94\u7528\u8FD9\u4E9B\u8BBE\u7F6E\uFF0C\u8BF7\u91CD\u8BD5\u3002"};var dp={en:Ku,"zh-CN":X0},q0="void-survey.locale";function Z0({storage:s=o1()}={}){let e="en";try{e=Y0(s?.getItem(q0))}catch{}function t(r,a={}){return(Object.hasOwn(dp[e],r)?dp[e][r]:Object.hasOwn(Ku,r)?Ku[r]:r).replace(/\{(\w+)\}/g,(l,c)=>Object.hasOwn(a,c)?String(a[c]):l)}function i(r){e=Y0(r);try{s?.setItem(q0,e)}catch{}return e}function n(r=document){let a=r.ownerDocument||r;a.documentElement&&(a.documentElement.lang=e);for(let o of r.querySelectorAll("[data-i18n]"))o.textContent=t(o.getAttribute("data-i18n"));for(let o of["title","aria-label","placeholder"]){let l=`data-i18n-${o}`;for(let c of r.querySelectorAll(`[${l}]`))c.setAttribute(o,t(c.getAttribute(l)))}}return{t,getLocale:()=>e,setLocale:i,translatePage:n}}function Y0(s){return Object.hasOwn(dp,s)?s:"en"}function o1(){try{return globalThis.localStorage}catch{return}}var pp={beginner:{width:9,height:9,mines:10},intermediate:{width:16,height:16,mines:40},expert:{width:30,height:16,mines:99}},$0=["right","left","up","down","front","back"],ju=Z0(),{t:ms}=ju,Wa=new Map,ue=s=>document.getElementById(s),mp=["localhost","127.0.0.1"].includes(location.hostname)&&new URLSearchParams(location.search).get("test")==="1",Yi=new qu,Tn=ue("scene-stage"),fe,Pt,Ju=pp.beginner,gc=pp.beginner,Xa=null,l1=14863,j0=!1,Q0="plane",$u="beginner",gs="reveal",$t=0,Qu=0,_c=0,fp="ready",ed=!1,td=null,K0,hr=[];function ur(s=Ju){Yi.reset(),Ju={...s},fe=new pr(mp?{...Ju,random:d1()}:Ju),$t=Math.floor(fe.height/2)*fe.width+Math.floor(fe.width/2),_c=0,Qu=0,fp="ready",nd("reveal"),c1(),h1();let e=fe.topology?"surface":"plane";j0&&e!==Q0?e_():Pt?.rebuild(fe.snapshot()),ue("top-view").setAttribute("aria-pressed",String(Pt?.topView??!1)),ue("result-panel").hidden=!0,id(),s_(),ue("timer").textContent="00:00",$e("cell-readout","game.choose")}function c1(){let s=!!fe.topology;document.body.dataset.boardMode=s?"surface":"plane",ue("board-mode").value=s?"surface":"plane",ue("plane-settings").hidden=s,ue("surface-settings").hidden=!s;let e=fe.topology;$e("surface-current",s?"game.surface.current":null,s?{depth:Math.round(e.irregularity*100),count:e.cellCount,mines:fe.mines}:{}),$e("surface-summary","game.surface.summary",{count:e?.cellCount??216,mines:s?fe.mines:30}),$e("surface-current",s?"game.surface.seed":null,{seed:e?.seed},"title"),$e("field-title",s?"game.field.surface":"game.field.plane"),$e("field-hint",s?"game.hint.surface":"game.hint.orbit");let t=document.querySelector(".mission-intro h1"),i=document.createTextNode(""),n=document.createElement("span");t.replaceChildren(i,n);let r=s?"surface":"plane";$e(i,`game.intro.${r}.first`),$e(n,`game.intro.${r}.second`);let a=document.querySelector(".mission-description"),o=document.createTextNode(""),l=document.createTextNode("");a.replaceChildren(o,document.createElement("br"),l),$e(o,`game.intro.${r}.lead`),$e(l,`game.intro.${r}.detail`),$e(Tn,`game.aria.stage.${r}`,{},"aria-label"),bp()}function e_(){j0=!0,Pt?.dispose(),Pt=null,ed=!1,Q0=fe.topology?"surface":"plane",Tn.classList.remove("fallback-active"),ue("fallback-board").hidden=!0;let s=ue("board-accessibility");document.querySelector(".scene-section").appendChild(s),s.classList.add("sr-only"),ue("reset-camera").disabled=!1,ue("top-view").disabled=!1;try{let e=fe.topology?Zu:Ha;Pt=new e(Tn,{onReveal:t=>_s("reveal",t),onFlag:t=>_s("flag",t),onChord:t=>_s("chord",t),onHover:xp,onFailure:J0,onExplosion:t=>Yi.playExplosion(t),onFirework:(t,i)=>Yi.playFirework(t,i),onFireworksStop:()=>Yi.stopFireworks(),onChainComplete:()=>{fe.status==="lost"&&(id(),_p())}}),Pt.rebuild(fe.snapshot()),Pt.setMode(gs),ue("scene-status").hidden=!0}catch(e){J0(e)}}function t_(){let s=ue("surface-shape").value;return{shape:s,resolution:Number(ue("surface-area").value),irregularity:s==="cube"?0:Number(ue("surface-irregularity").value)/100,density:Number(ue("surface-density").value)}}function i_(){let s=t_(),e=6*s.resolution**2,t=Math.round(s.irregularity*100);$e("surface-area-value","game.surface.tiles",{count:e}),$e("surface-area","game.surface.tiles",{count:e},"aria-valuetext"),$e("surface-irregularity-value",s.shape==="cube"?"game.off":"game.percent",{value:t}),ue("surface-irregularity").disabled=s.shape==="cube";let i=s.shape==="cube"?"regular":s.irregularity===0?"zero":s.irregularity>=.85?"deep":"opposite";$e("surface-relief-hint",`game.relief.${i}`),$e("surface-irregularity",s.shape==="cube"?"game.relief.off":"game.relief.value",{depth:t},"aria-valuetext"),$e("surface-density-value","game.surface.density",{density:s.density,mines:Math.floor(e*s.density/100)}),$e("surface-density","game.surface.density",{density:s.density,mines:Math.floor(e*s.density/100)},"aria-valuetext"),$e("surface-draft-note","game.draft.apply")}function gp(){let s=t_(),e=mp?++l1:crypto.getRandomValues(new Uint32Array(1))[0],t=H0({...s,seed:e});return{topology:t,mines:Math.floor(t.cellCount*s.density/100)}}function _s(s,e){if(!Number.isInteger(e)||e<0||e>=fe.cells.length)return;if(s==="flag"&&fe.status==="ready"){vp("game.mark_guard");return}let t=fe.status,i=s==="flag"?fe.toggleFlag(e):s==="chord"?fe.chord(e):fe.reveal(e);i.action!=="noop"&&(t==="ready"&&(Qu=performance.now(),fe.topology&&(ue("surface-generator").open=!1)),_c=Math.min(999,Math.floor((performance.now()-Qu)/1e3)),Pt?.update(fe.snapshot(),i),id(),s_(i.changed),xp(e),Yi.setMood(fe.status),(i.action!=="lose"||!Pt)&&Yi.play(i.action),fe.status!==fp&&["won","lost"].includes(fe.status)&&(fe.status==="lost"&&Pt?.detonation.active?($e("status-label","game.chain.title"),$e("status-description","game.chain.description")):_p()),fp=fe.status)}function id(){ue("mine-counter").textContent=String(fe.mines-fe.flagCount).padStart(2,"0");let s=Math.round(fe.revealedCount/(fe.cells.length-fe.mines)*100);ue("progress-value").textContent=`${s}%`,ue("progress-fill").style.width=`${s}%`,ue("progress-fill").parentElement?.setAttribute("aria-valuenow",String(s)),$e("status-label",`game.status.${fe.status}.title`);let e=fe.topology&&["ready","playing"].includes(fe.status)?".surface":"";$e("status-description",`game.status.${fe.status}${e}.description`),document.body.dataset.gameState=fe.status,ue("sector-size")&&$e("sector-size",fe.topology?"game.surface.size":"game.plane.size",{count:fe.cells.length,width:fe.width,height:fe.height}),ue("sector-mines")&&$e("sector-mines","game.mines",{mines:fe.mines})}function _p(){let s=fe.status==="won"?"won":"lost";$e("result-title",`game.result.${s}.title`),$e("result-description",`game.result.${s}.description`,{count:fe.revealedCount,time:l_(_c)}),ue("result-panel").hidden=!1,ue("result-panel").dataset.outcome=fe.status,vp(`game.result.${s}.toast`)}function nd(s){gs=s,Pt?.setMode(gs),ue("reveal-mode").setAttribute("aria-pressed",String(gs==="reveal")),ue("flag-mode").setAttribute("aria-pressed",String(gs==="flag")),document.body.dataset.inputMode=gs}function xp(s){if(s<0||!fe?.cells[s]){$e("cell-readout",fe?.status==="ready"?"game.choose":"game.hint.orbit");return}let e=fe.snapshot().cells[s];$e("cell-readout",fe.topology?"game.readout.surface":"game.readout.plane",()=>({id:e.id+1,label:n_(e,!0),neighbors:fe.neighbors(s).length,x:String(e.x+1).padStart(2,"0"),y:String(e.y+1).padStart(2,"0")}))}function n_(s,e=!1){return s.wrongFlag&&!e?ms("game.cell.wrong"):s.revealed?s.mine?ms("game.cell.mine"):!s.adjacent&&e?ms("game.cell.safe"):ms(s.adjacent===1?"game.cell.nearby_one":"game.cell.nearby_other",{count:s.adjacent}):ms(s.flagged?"game.cell.marked":"game.cell.covered")}function h1(){let s=ue("board-accessibility");s.innerHTML="",s.setAttribute("role","grid"),$e(s,fe.topology?"game.aria.board.surface":"game.aria.board.plane",{},"aria-label"),bp(),s.setAttribute("aria-rowcount",String(fe.height)),s.setAttribute("aria-colcount",String(fe.width)),s.style.setProperty("--columns",fe.width),hr=[];for(let e=0;e<fe.height;e++){if(fe.topology&&e%fe.topology.resolution===0){let i=document.createElement("div");i.className="surface-face-label",i.setAttribute("role","presentation");let n=$0[Math.floor(e/fe.topology.resolution)];$e(i,"game.face.heading",()=>({face:ms(`game.face.${n}`)})),s.appendChild(i)}let t=document.createElement("div");t.setAttribute("role","row");for(let i=0;i<fe.width;i++){let n=e*fe.width+i,r=document.createElement("button");r.type="button",r.dataset.cellId=String(n),r.setAttribute("role","gridcell"),fe.topology&&(r.dataset.face=String(fe.topology.cells[n].face)),r.setAttribute("aria-rowindex",String(e+1)),r.setAttribute("aria-colindex",String(i+1)),r.tabIndex=n===$t?0:-1,r.addEventListener("click",()=>_s(gs,n)),r.addEventListener("contextmenu",a=>{a.preventDefault(),_s("flag",n)}),r.addEventListener("dblclick",()=>_s("chord",n)),r.addEventListener("focus",()=>mc(n,!1)),hr.push(r),t.appendChild(r)}s.appendChild(t)}}function s_(s=fe.cells.map(e=>e.id)){let e=fe.snapshot();for(let t of s){let i=e.cells[t],n=hr[t];$e(n,fe.topology?"game.aria.cell.surface":"game.aria.cell.plane",()=>({face:ms(`game.face.${$0[i.face]}`),id:i.id+1,description:n_(i),neighbors:fe.neighbors(t).map(r=>r+1).join(", "),row:i.y+1,column:i.x+1}),"aria-label"),n.dataset.state=i.wrongFlag?"wrong":i.revealed?i.mine?"mine":"revealed":i.flagged?"flagged":"covered",n.textContent=i.wrongFlag?"\xD7":i.revealed?i.mine?"\u2726":i.adjacent||"\xB7":i.flagged?"\u25B2":""}}function mc(s,e=!0){if(hr[$t]?.setAttribute("tabindex","-1"),$t=s,hr[$t].tabIndex=0,Pt?.focus($t),xp($t),fe.topology){let t=new Set(fe.neighbors($t));for(let i of hr)i.dataset.neighbor=String(t.has(Number(i.dataset.cellId)))}e&&hr[$t].focus({preventScroll:!ed})}function u1(s,e){let t={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e],i=fe.topology,n=i.cells[s],r=Pt?.projectCell(s),a=_=>_.map((g,m)=>g-n.corners[0][m]),o=a(n.corners[1]),l=a(n.corners[3]),c=_=>{let g=Math.hypot(..._)||1;return _.map(m=>m/g)},h=c(o),d=c(l),u=(_,g)=>_.reduce((m,y,w)=>m+y*g[w],0),f=s,p=-1/0;for(let _ of fe.neighbors(s)){let g,m;if(Pt&&r){let b=Pt.projectCell(_);g=b.x-r.x,m=b.y-r.y}else{let b=i.cells[_].center.map((M,A)=>M-n.center[A]);g=u(b,h),m=u(b,d)}let y=Math.hypot(g,m);if(!y)continue;let w=g*t[0]+m*t[1];if(w<=0)continue;let v=w/y-y*1e-4;v>p&&(f=_,p=v)}return f}function J0(s){ed||(ed=!0,console.warn("3D rendering unavailable; accessible grid enabled.",s?.message||""),Pt?.dispose(),Pt=null,Tn.classList.add("fallback-active"),ue("fallback-board").hidden=!1,ue("fallback-board").appendChild(ue("board-accessibility")),ue("board-accessibility").classList.remove("sr-only"),$e("scene-status",fe?.topology?"game.fallback.surface":"game.fallback.plane"),ue("scene-status").hidden=!1,ue("reset-camera").disabled=!0,ue("top-view").disabled=!0,fe?.status==="lost"&&(id(),_p()))}function vp(s,e={}){clearTimeout(K0),$e("toast",s,e),ue("toast").hidden=!1,K0=setTimeout(()=>{ue("toast").hidden=!0},3200)}function xc(s){return fe.status!=="playing"?Promise.resolve(!0):td?Promise.resolve(!1):($e("confirm-title","game.confirm.title"),$e("confirm-description",s),ue("confirm-dialog").showModal(),new Promise(e=>{td=e}))}function yp(s){let e=td;td=null,ue("confirm-dialog").close(),e?.(s)}async function Mp(){await xc("game.confirm.restart")&&ur()}function $e(s,e,t={},i="textContent"){let n=typeof s=="string"?ue(s):s;Wa.has(n)||Wa.set(n,new Map);let r=Wa.get(n);e?r.set(i,{key:e,params:t}):r.delete(i);let a=e?ms(e,typeof t=="function"?t():t):"";i==="textContent"?n.textContent=a:n.setAttribute(i,a)}function bp(){for(let s of Wa.keys())s.isConnected||Wa.delete(s)}function r_(){ju.translatePage(),ue("language-select").value=ju.getLocale(),bp();for(let[s,e]of Wa)for(let[t,{key:i,params:n}]of e)$e(s,i,n,t)}function Sp(){for(let s of["sound","music"]){let e=ue(`${s}-toggle`).getAttribute("aria-pressed")==="true",t=`game.audio.${s}.${e?"mute":"unmute"}`;$e(`${s}-toggle`,t,{},"aria-label"),$e(`${s}-toggle`,t,{},"title");let i=ue(`${s}-toggle`).querySelector("[data-sound-label]");i&&$e(i,`game.audio.${e?"on":"off"}`)}}function a_(s){s.target.closest?.("#language-select")||Yi.unlock()}function o_(s){return s?.message==="Width must be an integer between 5 and 50"?"game.error.width":s?.message==="Height must be an integer between 5 and 30"?"game.error.height":s?.message?.startsWith("Mines must be an integer between 1 and")?"game.error.mines":"game.error.generic"}function wp(s,e){$e(s,o_(e))}function l_(s){return`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`}function d1(){let s=7127;return()=>(s=s*1664525+1013904223>>>0,s/4294967296)}document.addEventListener("pointerdown",s=>{s.target.closest?.("#language-select")||(Pt?.clearFocus(),Yi.unlock())},{capture:!0});document.addEventListener("pointerup",a_,{capture:!0});document.addEventListener("keydown",a_,{capture:!0});ue("reveal-mode").addEventListener("click",()=>nd("reveal"));ue("flag-mode").addEventListener("click",()=>nd("flag"));ue("new-game").addEventListener("click",Mp);ue("result-restart").addEventListener("click",Mp);ue("reset-camera").addEventListener("click",()=>Pt?.resetCamera());ue("top-view").addEventListener("click",()=>{let s=ue("top-view").getAttribute("aria-pressed")!=="true";ue("top-view").setAttribute("aria-pressed",String(s)),Pt?.setTopView(s)});ue("sound-toggle").addEventListener("click",()=>{let s=ue("sound-toggle").getAttribute("aria-pressed")!=="true";ue("sound-toggle").setAttribute("aria-pressed",String(s)),Sp(),Yi.setEnabled(s),Yi.play("flag")});ue("music-toggle").addEventListener("click",()=>{let s=ue("music-toggle").getAttribute("aria-pressed")!=="true";ue("music-toggle").setAttribute("aria-pressed",String(s)),Sp(),Yi.setMusicEnabled(s)});ue("help-btn").addEventListener("click",()=>ue("help-dialog").showModal());document.querySelectorAll("[data-close-dialog]").forEach(s=>s.addEventListener("click",()=>s.closest("dialog").close()));ue("confirm-accept").addEventListener("click",()=>yp(!0));ue("confirm-cancel").addEventListener("click",()=>yp(!1));ue("confirm-dialog").addEventListener("cancel",s=>{s.preventDefault(),yp(!1)});ue("settings-btn").addEventListener("click",()=>{let s=ue("settings-panel");s.hidden=!s.hidden,ue("settings-btn").setAttribute("aria-expanded",String(!s.hidden)),s.hidden||ue("board-mode").focus()});ue("preset-select").addEventListener("change",async()=>{let s=ue("preset-select").value;ue("custom-inputs").hidden=s!=="custom",$e("config-error",null),s!=="custom"&&(await xc("game.confirm.preset")?($u=s,gc=pp[s],ur(gc)):(ue("preset-select").value=$u,ue("custom-inputs").hidden=$u!=="custom"))});ue("apply-btn").addEventListener("click",async()=>{let s={width:Number(ue("custom-width").value),height:Number(ue("custom-height").value),mines:Number(ue("custom-mines").value)};try{new pr(s)}catch(e){wp("config-error",e);return}$e("config-error",null),await xc("game.confirm.custom")&&($u="custom",gc=s,ur(gc))});ue("surface-generator").open=!1;for(let s of["surface-shape","surface-area","surface-irregularity","surface-density"])ue(s).addEventListener("input",i_);ue("board-mode").addEventListener("change",async()=>{let s=ue("board-mode").value,e=fe.topology?"surface":"plane";if(s!==e){if(!await xc("game.confirm.mode")){ue("board-mode").value=e;return}try{s==="surface"?(Xa||=gp(),ur(Xa)):ur(gc)}catch(t){ue("board-mode").value=e,wp("config-error",t),vp(o_(t))}}});ue("surface-generate").addEventListener("click",async()=>{if(await xc("game.confirm.generate"))try{let s=gp();new pr(s),$e("surface-error",null),Xa=s,ur(Xa),$e("surface-draft-note","game.draft.ready"),matchMedia("(max-width: 760px)").matches&&(ue("surface-generator").open=!1)}catch(s){wp("surface-error",s)}});Tn.tabIndex=0;Tn.setAttribute("role","group");Tn.addEventListener("focus",()=>{Tn.matches(":focus-visible")&&Pt?.focus($t)});Tn.addEventListener("focusout",s=>{s.relatedTarget?.closest?.("#board-accessibility")||Pt?.clearFocus()});document.addEventListener("keydown",s=>{if(s.isComposing||s.altKey||s.ctrlKey||s.metaKey||document.querySelector("dialog[open]")||s.target.closest('input, select, textarea, [contenteditable="true"]'))return;let e=s.target===Tn||s.target.closest("#board-accessibility");if(e&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(s.key)){if(s.preventDefault(),fe.topology){mc(u1($t,s.key));return}let t=$t%fe.width,i=Math.floor($t/fe.width),n=Math.max(0,Math.min(fe.width-1,t+(s.key==="ArrowRight"?1:s.key==="ArrowLeft"?-1:0))),r=Math.max(0,Math.min(fe.height-1,i+(s.key==="ArrowDown"?1:s.key==="ArrowUp"?-1:0)));mc(r*fe.width+n)}else e&&["Enter"," "].includes(s.key)?(s.preventDefault(),mc($t,!1),_s(fe.cells[$t].revealed?"chord":gs,$t)):e&&s.key.toLowerCase()==="f"?(s.preventDefault(),mc($t,!1),_s("flag",$t)):s.key.toLowerCase()==="v"?ue("top-view").click():s.key.toLowerCase()==="r"?(s.preventDefault(),Mp()):s.key==="Escape"&&nd("reveal")});ue("language-select").addEventListener("change",()=>{ju.setLocale(ue("language-select").value),r_()});r_();Sp();i_();Xa=gp();ur(Xa);$e("surface-draft-note","game.draft.initial");e_();setInterval(()=>{fe.status==="playing"&&(_c=Math.min(999,Math.floor((performance.now()-Qu)/1e3))),ue("timer").textContent=l_(_c)},250);mp&&(window.__surveyTest={getGame:()=>fe,getScene:()=>Pt,getAudio:()=>Yi});})();
/*! For license information please see explorer.js.LEGAL.txt */
