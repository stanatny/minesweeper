(()=>{var H0=Object.defineProperty;var W0=(s,t)=>{for(var e in t)H0(s,e,{get:t[e],enumerable:!0})};var dr=class{constructor({width:t=9,height:e=9,mines:i=10,random:n=Math.random,topology:r=null}={}){if(this.topology=r===null?null:X0(r),this.topology){t=this.topology.width,e=this.topology.height,this.#e=this.topology.cells.map(l=>l.neighbors);let a=Math.max(...this.#e.map(l=>l.length)),o=this.topology.cellCount-a-1;if(!Number.isInteger(i)||i<1||i>o)throw new RangeError(`Mines must be an integer between 1 and ${o}`)}else{if(!Number.isInteger(t)||t<5||t>50)throw new RangeError("Width must be an integer between 5 and 50");if(!Number.isInteger(e)||e<5||e>30)throw new RangeError("Height must be an integer between 5 and 30");if(!Number.isInteger(i)||i<1||i>t*e-9)throw new RangeError("Mines must be an integer between 1 and width * height - 9")}if(typeof n!="function")throw new TypeError("Random must be a function");this.width=t,this.height=e,this.mines=i,this.status="ready",this.revealedCount=0,this.flagCount=0,this.#n=n,this.cells=Array.from({length:t*e},(a,o)=>({id:o,x:this.topology?this.topology.cells[o].x:o%t,y:this.topology?this.topology.cells[o].y:Math.floor(o/t),...this.topology?{face:this.topology.cells[o].face,u:this.topology.cells[o].u,v:this.topology.cells[o].v}:{},mine:!1,revealed:!1,flagged:!1,adjacent:0,exploded:!1,wrongFlag:!1}))}reveal(t){if(!this.#i(t))return this.#t();let e=this.cells[t];if(e.revealed||e.flagged)return this.#t();this.status==="ready"&&(this.#l(t),this.status="playing");let i=new Set;if(e.mine)return this.#a(t,i),this.#t(i,"lose");this.#r(t,i);let n=this.#o(i)?"win":"reveal";return this.#t(i,n)}toggleFlag(t){if(!this.#i(t)||this.status!=="playing")return this.#t();let e=this.cells[t];return e.revealed?this.#t():(e.flagged=!e.flagged,this.flagCount+=e.flagged?1:-1,this.#t(new Set([t]),e.flagged?"flag":"unflag"))}chord(t){if(!this.#i(t)||this.status!=="playing")return this.#t();let e=this.cells[t];if(!e.revealed||e.adjacent===0)return this.#t();let i=this.neighbors(t);if(i.filter(o=>this.cells[o].flagged).length!==e.adjacent)return this.#t();let r=new Set;for(let o of i){let l=this.cells[o];if(!(l.revealed||l.flagged)){if(l.mine)return this.#a(o,r),this.#t(r,"lose");this.#r(o,r)}}let a=this.#o(r)?"win":"chord";return this.#t(r,a)}neighbors(t){if(!this.#s(t))return[];if(this.#e)return[...this.#e[t]];let{x:e,y:i}=this.cells[t],n=[];for(let r=-1;r<=1;r+=1)for(let a=-1;a<=1;a+=1){if(a===0&&r===0)continue;let o=e+a,l=i+r;o<0||l<0||o>=this.width||l>=this.height||n.push(l*this.width+o)}return n}snapshot(){return{width:this.width,height:this.height,mines:this.mines,status:this.status,revealedCount:this.revealedCount,flagCount:this.flagCount,topology:this.topology,cells:this.cells.map(t=>({...t,mine:t.revealed?t.mine:null,adjacent:t.revealed?t.adjacent:null}))}}#n;#e=null;#s(t){return Number.isInteger(t)&&t>=0&&t<this.cells.length}#i(t){return this.#s(t)&&(this.status==="ready"||this.status==="playing")}#t(t=new Set,e="noop"){return{changed:[...t],outcome:this.status,action:t.size>0?e:"noop"}}#l(t){let e=new Set([t,...this.neighbors(t)]),i=this.cells.filter(n=>!e.has(n.id)).map(n=>n.id);for(let n=i.length-1;n>0;n-=1){let r=this.#n();if(!Number.isFinite(r)||r<0||r>=1)throw new RangeError("Random must return a finite number in [0, 1)");let a=Math.floor(r*(n+1));[i[n],i[a]]=[i[a],i[n]]}for(let n of i.slice(0,this.mines))this.cells[n].mine=!0;for(let n of this.cells)n.mine||(n.adjacent=this.neighbors(n.id).filter(r=>this.cells[r].mine).length)}#r(t,e){let i=[t],n=new Set(i);for(let r=0;r<i.length;r+=1){let a=this.cells[i[r]];if(!(a.revealed||a.flagged||a.mine)&&(a.revealed=!0,this.revealedCount+=1,e.add(a.id),a.adjacent===0))for(let o of this.neighbors(a.id)){let l=this.cells[o];l.revealed||l.flagged||l.mine||n.has(o)||(i.push(o),n.add(o))}}}#a(t,e){this.status="lost",this.cells[t].exploded=!0;for(let i of this.cells)i.mine?(i.revealed=!0,e.add(i.id)):i.flagged&&(i.wrongFlag=!0,e.add(i.id))}#o(t){if(this.revealedCount!==this.cells.length-this.mines)return!1;this.status="won";for(let e of this.cells)e.mine&&!e.flagged&&(e.flagged=!0,this.flagCount+=1,t.add(e.id));return!0}};function X0(s){if(!s||s.kind!=="surface"||!Array.isArray(s.cells)||!Number.isInteger(s.width)||s.width<1||!Number.isInteger(s.height)||s.height<1||s.cells.length!==s.width*s.height||s.cellCount!==s.cells.length)throw new TypeError("Topology must contain a valid surface cell map");let t=s.cells.map((r,a)=>{if(!r||r.id!==a||!Number.isInteger(r.x)||!Number.isInteger(r.y)||r.x<0||r.x>=s.width||r.y<0||r.y>=s.height||!Array.isArray(r.neighbors)||r.neighbors.length===0||new Set(r.neighbors).size!==r.neighbors.length||r.neighbors.some(l=>!Number.isInteger(l)||l<0||l>=s.cells.length||l===a))throw new TypeError("Topology cells must have sequential IDs and valid unique neighbors");let o={id:a,x:r.x,y:r.y,neighbors:[...r.neighbors]};for(let l of["face","u","v","patchSize"])if(r[l]!==void 0){if(!Number.isInteger(r[l])||r[l]<0)throw new TypeError("Topology coordinates and patch sizes must be nonnegative integers");o[l]=r[l]}for(let l of["center","normal"])r[l]!==void 0&&(o[l]=Ku(r[l]));for(let l of["corners","patch"])if(r[l]!==void 0){if(!Array.isArray(r[l]))throw new TypeError("Topology geometry must contain arrays of finite vectors");o[l]=r[l].map(Ku)}return o});for(let r of t)for(let a of r.neighbors)if(!t[a].neighbors.includes(r.id))throw new TypeError("Topology neighbors must be symmetric");let e=new Set([0]),i=[0];for(let r=0;r<i.length;r+=1)for(let a of t[i[r]].neighbors)e.has(a)||(e.add(a),i.push(a));if(e.size!==t.length)throw new TypeError("Topology must form one connected surface");let n={kind:"surface",width:s.width,height:s.height,cellCount:t.length,cells:t};for(let r of["resolution","seed","irregularity","radius","surfaceArea","patchSize","maxDegree"])if(s[r]!==void 0){if(!Number.isFinite(s[r]))throw new TypeError("Topology metadata must contain finite numbers");n[r]=s[r]}return typeof s.shape=="string"&&(n.shape=s.shape),s.viewDirection!==void 0&&(n.viewDirection=Ku(s.viewDirection)),yp(n)}function Ku(s){if(!Array.isArray(s)||s.length!==3||!s.every(Number.isFinite))throw new TypeError("Topology positions and normals must be finite 3D vectors");return[...s]}function yp(s){if(s&&typeof s=="object"&&!Object.isFrozen(s)){for(let t of Object.values(s))yp(t);Object.freeze(s)}return s}var ds={};W0(ds,{ACESFilmicToneMapping:()=>hs,AddEquation:()=>cs,AddOperation:()=>gf,AdditiveAnimationBlendMode:()=>Mu,AdditiveBlending:()=>Fn,AgXToneMapping:()=>va,AlphaFormat:()=>vu,AlwaysCompare:()=>Rf,AlwaysDepth:()=>lo,AlwaysStencilFunc:()=>Sf,AmbientLight:()=>Ks,AnimationAction:()=>dl,AnimationClip:()=>os,AnimationLoader:()=>Th,AnimationMixer:()=>Bh,AnimationObjectGroup:()=>Oh,AnimationUtils:()=>wh,ArcCurve:()=>Io,ArrayCamera:()=>cl,ArrowHelper:()=>ru,AttachedBindMode:()=>sh,Audio:()=>hl,AudioAnalyser:()=>Fh,AudioContext:()=>ha,AudioListener:()=>Nh,AudioLoader:()=>Lh,AxesHelper:()=>au,BackSide:()=>ri,BasicDepthPacking:()=>Mf,BasicShadowMap:()=>Dm,BatchedMesh:()=>So,BezierInterpolant:()=>tl,Bone:()=>qr,BooleanKeyframeTrack:()=>mn,Box2:()=>fl,Box3:()=>He,Box3Helper:()=>nu,BoxGeometry:()=>Ke,BoxHelper:()=>iu,BufferAttribute:()=>he,BufferGeometry:()=>kt,BufferGeometryLoader:()=>ol,ByteType:()=>mu,Cache:()=>Ki,Camera:()=>$s,CameraHelper:()=>eu,CanvasTexture:()=>fn,CapsuleGeometry:()=>Ao,CatmullRomCurve3:()=>Lo,CineonToneMapping:()=>_a,CircleGeometry:()=>Co,ClampToEdgeWrapping:()=>hi,Clock:()=>Wh,Color:()=>at,ColorKeyframeTrack:()=>ra,ColorManagement:()=>te,Compatibility:()=>yg,CompressedArrayTexture:()=>yh,CompressedCubeTexture:()=>Mh,CompressedTexture:()=>ks,CompressedTextureLoader:()=>Eh,ConeGeometry:()=>Zr,ConstantAlphaFactor:()=>ff,ConstantColorFactor:()=>uf,Controls:()=>da,CubeCamera:()=>ll,CubeDepthTexture:()=>Eo,CubeReflectionMapping:()=>sn,CubeRefractionMapping:()=>On,CubeTexture:()=>ns,CubeTextureLoader:()=>Ah,CubeUVReflectionMapping:()=>ir,CubicBezierCurve:()=>$r,CubicBezierCurve3:()=>Do,CubicInterpolant:()=>jo,CullFaceBack:()=>cu,CullFaceFront:()=>Zd,CullFaceFrontBack:()=>Lm,CullFaceNone:()=>Yd,Curve:()=>yi,CurvePath:()=>Uo,CustomBlending:()=>Jd,CustomToneMapping:()=>xa,CylinderGeometry:()=>Bi,Cylindrical:()=>Xh,Data3DTexture:()=>Ds,DataArrayTexture:()=>Ls,DataTexture:()=>ui,DataTextureLoader:()=>Ch,DataUtils:()=>ch,DecrementStencilOp:()=>jm,DecrementWrapStencilOp:()=>tg,DefaultLoadingManager:()=>Nf,DepthFormat:()=>ji,DepthStencilFormat:()=>Bn,DepthTexture:()=>Ln,DetachedBindMode:()=>_f,DirectionalLight:()=>_n,DirectionalLightHelper:()=>tu,DiscreteInterpolant:()=>Qo,DodecahedronGeometry:()=>Ro,DoubleSide:()=>fi,DstAlphaFactor:()=>af,DstColorFactor:()=>lf,DynamicCopyUsage:()=>pg,DynamicDrawUsage:()=>us,DynamicReadUsage:()=>ug,EdgesGeometry:()=>Po,EllipseCurve:()=>Vs,EqualCompare:()=>Ef,EqualDepth:()=>ho,EqualStencilFunc:()=>sg,EquirectangularReflectionMapping:()=>Ma,EquirectangularRefractionMapping:()=>ba,Euler:()=>Oi,EventDispatcher:()=>vi,ExternalTexture:()=>Yr,ExtrudeGeometry:()=>Hs,FileLoader:()=>Vi,Float16BufferAttribute:()=>mh,Float32BufferAttribute:()=>vt,FloatType:()=>ni,Fog:()=>xo,FogExp2:()=>_o,FramebufferTexture:()=>vh,FrontSide:()=>Un,Frustum:()=>dn,FrustumArray:()=>bo,GLBufferAttribute:()=>Hh,GLSL1:()=>gg,GLSL3:()=>bu,GreaterCompare:()=>Af,GreaterDepth:()=>fo,GreaterEqualCompare:()=>Ql,GreaterEqualDepth:()=>uo,GreaterEqualStencilFunc:()=>lg,GreaterStencilFunc:()=>ag,GridHelper:()=>jh,Group:()=>Ti,HTMLTexture:()=>bh,HalfFloatType:()=>$e,HemisphereLight:()=>Ys,HemisphereLightHelper:()=>Kh,IcosahedronGeometry:()=>ss,ImageBitmapLoader:()=>Ih,ImageLoader:()=>ls,ImageUtils:()=>go,IncrementStencilOp:()=>Km,IncrementWrapStencilOp:()=>Qm,InstancedBufferAttribute:()=>In,InstancedBufferGeometry:()=>al,InstancedInterleavedBuffer:()=>Gh,InstancedMesh:()=>De,Int16BufferAttribute:()=>fh,Int32BufferAttribute:()=>ph,Int8BufferAttribute:()=>hh,IntType:()=>ml,InterleavedBuffer:()=>Os,InterleavedBufferAttribute:()=>ts,Interpolant:()=>Nn,InterpolateBezier:()=>rh,InterpolateDiscrete:()=>Or,InterpolateLinear:()=>mo,InterpolateSmooth:()=>eo,InterpolationSamplingMode:()=>vg,InterpolationSamplingType:()=>xg,InvertStencilOp:()=>eg,KeepStencilOp:()=>io,KeyframeTrack:()=>di,LOD:()=>vo,LatheGeometry:()=>zo,Layers:()=>Ns,LessCompare:()=>Tf,LessDepth:()=>co,LessEqualCompare:()=>jl,LessEqualDepth:()=>Ps,LessEqualStencilFunc:()=>rg,LessStencilFunc:()=>ng,Light:()=>nn,LightProbe:()=>sl,LightShadow:()=>Zs,Line:()=>tn,Line3:()=>Yh,LineBasicMaterial:()=>Ze,LineCurve:()=>Jr,LineCurve3:()=>No,LineDashedMaterial:()=>Ko,LineLoop:()=>wo,LineSegments:()=>Ai,LinearFilter:()=>Se,LinearInterpolant:()=>sa,LinearMipMapLinearFilter:()=>Bm,LinearMipMapNearestFilter:()=>Om,LinearMipmapLinearFilter:()=>rn,LinearMipmapNearestFilter:()=>Sa,LinearSRGBColorSpace:()=>zr,LinearToneMapping:()=>ma,LinearTransfer:()=>kr,Loader:()=>je,LoaderUtils:()=>ca,LoadingManager:()=>oa,LoopOnce:()=>xf,LoopPingPong:()=>yf,LoopRepeat:()=>vf,MOUSE:()=>Hi,Material:()=>Ve,MaterialBlending:()=>Nm,MaterialLoader:()=>rl,MathUtils:()=>Ia,Matrix2:()=>qh,Matrix3:()=>Zt,Matrix4:()=>Ht,MaxEquation:()=>tf,Mesh:()=>ee,MeshBasicMaterial:()=>ce,MeshDepthMaterial:()=>ia,MeshDistanceMaterial:()=>na,MeshLambertMaterial:()=>$o,MeshMatcapMaterial:()=>Jo,MeshNormalMaterial:()=>Zo,MeshPhongMaterial:()=>qo,MeshPhysicalMaterial:()=>Xo,MeshStandardMaterial:()=>Ge,MeshToonMaterial:()=>Yo,MinEquation:()=>Qd,MirroredRepeatWrapping:()=>Fr,MixOperation:()=>mf,MultiplyBlending:()=>uu,MultiplyOperation:()=>pa,NearestFilter:()=>Ie,NearestMipMapLinearFilter:()=>Fm,NearestMipMapNearestFilter:()=>Um,NearestMipmapLinearFilter:()=>nr,NearestMipmapNearestFilter:()=>pu,NeutralToneMapping:()=>ya,NeverCompare:()=>wf,NeverDepth:()=>oo,NeverStencilFunc:()=>ig,NoBlending:()=>Ri,NoColorSpace:()=>vn,NoNormalPacking:()=>qm,NoToneMapping:()=>Wi,NormalAnimationBlendMode:()=>Kl,NormalBlending:()=>er,NormalGAPacking:()=>Zm,NormalRGPacking:()=>Ym,NotEqualCompare:()=>Cf,NotEqualDepth:()=>po,NotEqualStencilFunc:()=>og,NumberKeyframeTrack:()=>Xs,Object3D:()=>re,ObjectLoader:()=>Ph,ObjectSpaceNormalMap:()=>bf,OctahedronGeometry:()=>ki,OneFactor:()=>nf,OneMinusConstantAlphaFactor:()=>pf,OneMinusConstantColorFactor:()=>df,OneMinusDstAlphaFactor:()=>of,OneMinusDstColorFactor:()=>cf,OneMinusSrcAlphaFactor:()=>fu,OneMinusSrcColorFactor:()=>rf,OrthographicCamera:()=>Gi,PCFShadowMap:()=>fa,PCFSoftShadowMap:()=>$d,PMREMGenerator:()=>sc,Path:()=>pn,PerspectiveCamera:()=>ze,Plane:()=>_i,PlaneGeometry:()=>Ci,PlaneHelper:()=>su,PointLight:()=>Js,PointLightHelper:()=>Jh,Points:()=>zs,PointsMaterial:()=>is,PolarGridHelper:()=>Qh,PolyhedronGeometry:()=>Dn,PositionalAudio:()=>Uh,PropertyBinding:()=>me,PropertyMixer:()=>ul,QuadraticBezierCurve:()=>Kr,QuadraticBezierCurve3:()=>jr,Quaternion:()=>Te,QuaternionKeyframeTrack:()=>qs,QuaternionLinearInterpolant:()=>el,R11_EAC_Format:()=>Cl,RED_GREEN_RGTC2_Format:()=>Pa,RED_RGTC1_Format:()=>Zl,REVISION:()=>qd,RG11_EAC_Format:()=>Ra,RGBADepthPacking:()=>Hm,RGBAFormat:()=>si,RGBAIntegerFormat:()=>yl,RGBA_ASTC_10x10_Format:()=>Gl,RGBA_ASTC_10x5_Format:()=>zl,RGBA_ASTC_10x6_Format:()=>kl,RGBA_ASTC_10x8_Format:()=>Vl,RGBA_ASTC_12x10_Format:()=>Hl,RGBA_ASTC_12x12_Format:()=>Wl,RGBA_ASTC_4x4_Format:()=>Il,RGBA_ASTC_5x4_Format:()=>Ll,RGBA_ASTC_5x5_Format:()=>Dl,RGBA_ASTC_6x5_Format:()=>Nl,RGBA_ASTC_6x6_Format:()=>Ul,RGBA_ASTC_8x5_Format:()=>Fl,RGBA_ASTC_8x6_Format:()=>Ol,RGBA_ASTC_8x8_Format:()=>Bl,RGBA_BPTC_Format:()=>Xl,RGBA_ETC2_EAC_Format:()=>Al,RGBA_PVRTC_2BPPV1_Format:()=>wl,RGBA_PVRTC_4BPPV1_Format:()=>Sl,RGBA_S3TC_DXT1_Format:()=>Ea,RGBA_S3TC_DXT3_Format:()=>Aa,RGBA_S3TC_DXT5_Format:()=>Ca,RGBDepthPacking:()=>Wm,RGBFormat:()=>yu,RGBIntegerFormat:()=>zm,RGB_BPTC_SIGNED_Format:()=>ql,RGB_BPTC_UNSIGNED_Format:()=>Yl,RGB_ETC1_Format:()=>Tl,RGB_ETC2_Format:()=>El,RGB_PVRTC_2BPPV1_Format:()=>bl,RGB_PVRTC_4BPPV1_Format:()=>Ml,RGB_S3TC_DXT1_Format:()=>Ta,RGDepthPacking:()=>Xm,RGFormat:()=>zn,RGIntegerFormat:()=>vl,RawShaderMaterial:()=>as,Ray:()=>Qi,Raycaster:()=>ua,RectAreaLight:()=>nl,RedFormat:()=>xl,RedIntegerFormat:()=>wa,ReinhardToneMapping:()=>ga,RenderObjectRefreshType:()=>Mg,RenderTarget:()=>Hr,RenderTarget3D:()=>zh,RepeatWrapping:()=>Ur,ReplaceStencilOp:()=>Jm,ReverseSubtractEquation:()=>jd,RingGeometry:()=>rs,SIGNED_R11_EAC_Format:()=>Rl,SIGNED_RED_GREEN_RGTC2_Format:()=>Jl,SIGNED_RED_RGTC1_Format:()=>$l,SIGNED_RG11_EAC_Format:()=>Pl,SRGBColorSpace:()=>Be,SRGBTransfer:()=>le,Scene:()=>Fs,ShaderChunk:()=>jt,ShaderLib:()=>an,ShaderMaterial:()=>Ce,ShadowMaterial:()=>Wo,Shape:()=>zi,ShapeGeometry:()=>Ws,ShapePath:()=>ou,ShapeUtils:()=>Fi,ShortType:()=>gu,Skeleton:()=>Mo,SkeletonHelper:()=>$h,SkinnedMesh:()=>yo,Source:()=>ah,Sphere:()=>ke,SphereGeometry:()=>ea,Spherical:()=>Qs,SphericalHarmonics3:()=>la,SplineCurve:()=>Qr,SpotLight:()=>il,SpotLightHelper:()=>Zh,Sprite:()=>Bs,SpriteMaterial:()=>es,SrcAlphaFactor:()=>du,SrcAlphaSaturateFactor:()=>hf,SrcColorFactor:()=>sf,StaticCopyUsage:()=>fg,StaticDrawUsage:()=>tc,StaticReadUsage:()=>hg,StereoCamera:()=>Dh,StreamCopyUsage:()=>mg,StreamDrawUsage:()=>cg,StreamReadUsage:()=>dg,StringKeyframeTrack:()=>gn,SubtractEquation:()=>Kd,SubtractiveBlending:()=>hu,TOUCH:()=>Mi,TangentSpaceNormalMap:()=>xn,TetrahedronGeometry:()=>ko,Texture:()=>Le,TextureLoader:()=>Rh,TextureSource:()=>Ui,TextureUtils:()=>lu,Timer:()=>js,TimestampQuery:()=>_g,TorusGeometry:()=>en,TorusKnotGeometry:()=>Vo,Triangle:()=>Ji,TriangleFanDrawMode:()=>Gm,TriangleStripDrawMode:()=>Vm,TrianglesDrawMode:()=>km,TubeGeometry:()=>Go,UVMapping:()=>pl,Uint16BufferAttribute:()=>Wr,Uint32BufferAttribute:()=>Xr,Uint8BufferAttribute:()=>uh,Uint8ClampedBufferAttribute:()=>dh,Uniform:()=>kh,UniformsGroup:()=>Vh,UniformsLib:()=>yt,UniformsUtils:()=>yn,UnsignedByteType:()=>pi,UnsignedInt101111Type:()=>xu,UnsignedInt248Type:()=>rr,UnsignedInt5999Type:()=>_u,UnsignedIntType:()=>Pi,UnsignedShort4444Type:()=>gl,UnsignedShort5551Type:()=>_l,UnsignedShortType:()=>sr,VSMShadowMap:()=>tr,Vector2:()=>q,Vector3:()=>C,Vector4:()=>ge,VectorKeyframeTrack:()=>aa,VideoFrameTexture:()=>xh,VideoTexture:()=>To,WebGL3DRenderTarget:()=>lh,WebGLArrayRenderTarget:()=>oh,WebGLCoordinateSystem:()=>xi,WebGLCubeRenderTarget:()=>rc,WebGLRenderTarget:()=>Ae,WebGLRenderer:()=>ac,WebGLUtils:()=>u0,WebGPUCoordinateSystem:()=>jn,WebXRController:()=>Us,WireframeGeometry:()=>Ho,WrapAroundEnding:()=>Br,ZeroCurvatureEnding:()=>Jn,ZeroFactor:()=>ef,ZeroSlopeEnding:()=>Kn,ZeroStencilOp:()=>$m,createCanvasElement:()=>Pf,error:()=>Dt,getConsoleFunction:()=>wg,log:()=>Gr,setConsoleFunction:()=>Sg,warn:()=>pt,warnOnce:()=>un});var qd="186",Hi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Mi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Yd=0,cu=1,Zd=2,Lm=3,Dm=0,fa=1,$d=2,tr=3,Un=0,ri=1,fi=2,Ri=0,er=1,Fn=2,hu=3,uu=4,Jd=5,Nm=6,cs=100,Kd=101,jd=102,Qd=103,tf=104,ef=200,nf=201,sf=202,rf=203,du=204,fu=205,af=206,of=207,lf=208,cf=209,hf=210,uf=211,df=212,ff=213,pf=214,oo=0,lo=1,co=2,Ps=3,ho=4,uo=5,fo=6,po=7,pa=0,mf=1,gf=2,Wi=0,ma=1,ga=2,_a=3,hs=4,xa=5,va=6,ya=7,sh="attached",_f="detached",pl=300,sn=301,On=302,Ma=303,ba=304,ir=306,Ur=1e3,hi=1001,Fr=1002,Ie=1003,pu=1004,Um=1004,nr=1005,Fm=1005,Se=1006,Sa=1007,Om=1007,rn=1008,Bm=1008,pi=1009,mu=1010,gu=1011,sr=1012,ml=1013,Pi=1014,ni=1015,$e=1016,gl=1017,_l=1018,rr=1020,_u=35902,xu=35899,vu=1021,yu=1022,si=1023,ji=1026,Bn=1027,xl=1028,wa=1029,zn=1030,vl=1031,zm=1032,yl=1033,Ta=33776,Ea=33777,Aa=33778,Ca=33779,Ml=35840,bl=35841,Sl=35842,wl=35843,Tl=36196,El=37492,Al=37496,Cl=37488,Rl=37489,Ra=37490,Pl=37491,Il=37808,Ll=37809,Dl=37810,Nl=37811,Ul=37812,Fl=37813,Ol=37814,Bl=37815,zl=37816,kl=37817,Vl=37818,Gl=37819,Hl=37820,Wl=37821,Xl=36492,ql=36494,Yl=36495,Zl=36283,$l=36284,Pa=36285,Jl=36286,xf=2200,vf=2201,yf=2202,Or=2300,mo=2301,eo=2302,rh=2303,Jn=2400,Kn=2401,Br=2402,Kl=2500,Mu=2501,km=0,Vm=1,Gm=2,Mf=3200,Hm=3201,Wm=3202,Xm=3203,xn=0,bf=1,vn="",Be="srgb",zr="srgb-linear",kr="linear",le="srgb",qm="",Ym="rg",Zm="ga",$m=0,io=7680,Jm=7681,Km=7682,jm=7683,Qm=34055,tg=34056,eg=5386,ig=512,ng=513,sg=514,rg=515,ag=516,og=517,lg=518,Sf=519,wf=512,Tf=513,Ef=514,jl=515,Af=516,Cf=517,Ql=518,Rf=519,tc=35044,us=35048,cg=35040,hg=35045,ug=35049,dg=35041,fg=35046,pg=35050,mg=35042,gg="100",bu="300 es",xi=2e3,jn=2001,_g={COMPUTE:"compute",RENDER:"render"},xg={PERSPECTIVE:"perspective",LINEAR:"linear",FLAT:"flat"},vg={NORMAL:"normal",CENTROID:"centroid",SAMPLE:"sample",FIRST:"first",EITHER:"either"},yg={TEXTURE_COMPARE:"depthTextureCompare"},Mg={NONE:0,SHARED:1,FULL:2};function q0(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}var Y0={Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array};function Dr(s,t){return new Y0[s](t)}function bg(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Vr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Pf(){let s=Vr("canvas");return s.style.display="block",s}var Mp={},Qn=null;function Sg(s){Qn=s}function wg(){return Qn}function Gr(...s){let t="THREE."+s.shift();Qn?Qn("log",t,...s):console.log(t,...s)}function Tg(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function pt(...s){s=Tg(s);let t="THREE."+s.shift();if(Qn)Qn("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function Dt(...s){s=Tg(s);let t="THREE."+s.shift();if(Qn)Qn("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function un(...s){let t=s.join(" ");t in Mp||(Mp[t]=!0,pt(...s))}function Eg(s,t,e){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var Ag={[oo]:lo,[co]:fo,[ho]:po,[Ps]:uo,[lo]:oo,[fo]:co,[po]:ho,[uo]:Ps},vi=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let r=n.indexOf(e);r!==-1&&n.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let r=0,a=n.length;r<a;r++)n[r].call(this,t);t.target=null}}},ti=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],bp=1234567,Rs=Math.PI/180,Is=180/Math.PI;function Ei(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(ti[s&255]+ti[s>>8&255]+ti[s>>16&255]+ti[s>>24&255]+"-"+ti[t&255]+ti[t>>8&255]+"-"+ti[t>>16&15|64]+ti[t>>24&255]+"-"+ti[e&63|128]+ti[e>>8&255]+"-"+ti[e>>16&255]+ti[e>>24&255]+ti[i&255]+ti[i>>8&255]+ti[i>>16&255]+ti[i>>24&255]).toLowerCase()}function Xt(s,t,e){return Math.max(t,Math.min(e,s))}function If(s,t){return(s%t+t)%t}function Z0(s,t,e,i,n){return i+(s-t)*(n-i)/(e-t)}function $0(s,t,e){return s!==t?(e-s)/(t-s):0}function no(s,t,e){return(1-e)*s+e*t}function J0(s,t,e,i){return no(s,t,1-Math.exp(-e*i))}function K0(s,t=1){return t-Math.abs(If(s,t*2)-t)}function j0(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function Q0(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function t_(s,t){return s+Math.floor(Math.random()*(t-s+1))}function e_(s,t){return s+Math.random()*(t-s)}function i_(s){return s*(.5-Math.random())}function n_(s){s!==void 0&&(bp=s);let t=bp+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function s_(s){return s*Rs}function r_(s){return s*Is}function a_(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function o_(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function l_(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function c_(s,t,e,i,n){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+i)/2),h=a((t+i)/2),d=r((t-i)/2),u=a((t-i)/2),f=r((i-t)/2),p=a((i-t)/2);switch(n){case"XYX":s.set(o*h,l*d,l*u,o*c);break;case"YZY":s.set(l*u,o*h,l*d,o*c);break;case"ZXZ":s.set(l*d,l*u,o*h,o*c);break;case"XZX":s.set(o*h,l*p,l*f,o*c);break;case"YXY":s.set(l*f,o*h,l*p,o*c);break;case"ZYZ":s.set(l*p,l*f,o*h,o*c);break;default:pt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function ci(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Kt(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Ia={DEG2RAD:Rs,RAD2DEG:Is,generateUUID:Ei,clamp:Xt,euclideanModulo:If,mapLinear:Z0,inverseLerp:$0,lerp:no,damp:J0,pingpong:K0,smoothstep:j0,smootherstep:Q0,randInt:t_,randFloat:e_,randFloatSpread:i_,seededRandom:n_,degToRad:s_,radToDeg:r_,isPowerOfTwo:a_,ceilPowerOfTwo:o_,floorPowerOfTwo:l_,setQuaternionFromProperEuler:c_,normalize:Kt,denormalize:ci},q=class s{static{s.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Xt(this.x,t.x,e.x),this.y=Xt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Xt(this.x,t,e),this.y=Xt(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Xt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Xt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*i-a*n+t.x,this.y=r*n+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Te=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,r,a,o){let l=i[n+0],c=i[n+1],h=i[n+2],d=i[n+3],u=r[a+0],f=r[a+1],p=r[a+2],_=r[a+3];if(d!==_||l!==u||c!==f||h!==p){let g=l*u+c*f+h*p+d*_;g<0&&(u=-u,f=-f,p=-p,_=-_,g=-g);let m=1-o;if(g<.9995){let y=Math.acos(g),w=Math.sin(y);m=Math.sin(m*y)/w,o=Math.sin(o*y)/w,l=l*m+u*o,c=c*m+f*o,h=h*m+p*o,d=d*m+_*o}else{l=l*m+u*o,c=c*m+f*o,h=h*m+p*o,d=d*m+_*o;let y=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=y,c*=y,h*=y,d*=y}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,i,n,r,a){let o=i[n],l=i[n+1],c=i[n+2],h=i[n+3],d=r[a],u=r[a+1],f=r[a+2],p=r[a+3];return t[e]=o*p+h*d+l*f-c*u,t[e+1]=l*p+h*u+c*d-o*f,t[e+2]=c*p+h*f+o*u-l*d,t[e+3]=h*p-o*d-l*u-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(n/2),d=o(r/2),u=l(i/2),f=l(n/2),p=l(r/2);switch(a){case"XYZ":this._x=u*h*d+c*f*p,this._y=c*f*d-u*h*p,this._z=c*h*p+u*f*d,this._w=c*h*d-u*f*p;break;case"YXZ":this._x=u*h*d+c*f*p,this._y=c*f*d-u*h*p,this._z=c*h*p-u*f*d,this._w=c*h*d+u*f*p;break;case"ZXY":this._x=u*h*d-c*f*p,this._y=c*f*d+u*h*p,this._z=c*h*p+u*f*d,this._w=c*h*d-u*f*p;break;case"ZYX":this._x=u*h*d-c*f*p,this._y=c*f*d+u*h*p,this._z=c*h*p-u*f*d,this._w=c*h*d+u*f*p;break;case"YZX":this._x=u*h*d+c*f*p,this._y=c*f*d+u*h*p,this._z=c*h*p-u*f*d,this._w=c*h*d-u*f*p;break;case"XZY":this._x=u*h*d-c*f*p,this._y=c*f*d-u*h*p,this._z=c*h*p+u*f*d,this._w=c*h*d+u*f*p;break;default:pt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=i+o+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-n)*f}else if(i>o&&i>d){let f=2*Math.sqrt(1+i-o-d);this._w=(h-l)/f,this._x=.25*f,this._y=(n+a)/f,this._z=(r+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-i-d);this._w=(r-c)/f,this._x=(n+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+d-i-o);this._w=(a-n)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Xt(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+a*o+n*c-r*l,this._y=n*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-n*o,this._w=a*h-i*o-n*l-r*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(i=-i,n=-n,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},C=class s{static{s.prototype.isVector3=!0}constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Sp.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Sp.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*n,this.y=r[1]*e+r[4]*i+r[7]*n,this.z=r[2]*e+r[5]*i+r[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=t.elements,a=1/(r[3]*e+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*n+r[12])*a,this.y=(r[1]*e+r[5]*i+r[9]*n+r[13])*a,this.z=(r[2]*e+r[6]*i+r[10]*n+r[14])*a,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*n-o*i),h=2*(o*e-r*n),d=2*(r*i-a*e);return this.x=e+l*c+a*d-o*h,this.y=i+l*h+o*c-r*d,this.z=n+l*d+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*n,this.y=r[1]*e+r[5]*i+r[9]*n,this.z=r[2]*e+r[6]*i+r[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Xt(this.x,t.x,e.x),this.y=Xt(this.y,t.y,e.y),this.z=Xt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Xt(this.x,t,e),this.y=Xt(this.y,t,e),this.z=Xt(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Xt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=n*l-r*o,this.y=r*a-i*l,this.z=i*o-n*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return ju.copy(this).projectOnVector(t),this.sub(ju)}reflect(t){return this.sub(ju.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Xt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ju=new C,Sp=new Te,Zt=class s{static{s.prototype.isMatrix3=!0}constructor(t,e,i,n,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,a,o,l,c)}set(t,e,i,n,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=n,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],d=i[7],u=i[2],f=i[5],p=i[8],_=n[0],g=n[3],m=n[6],y=n[1],w=n[4],x=n[7],M=n[2],S=n[5],A=n[8];return r[0]=a*_+o*y+l*M,r[3]=a*g+o*w+l*S,r[6]=a*m+o*x+l*A,r[1]=c*_+h*y+d*M,r[4]=c*g+h*w+d*S,r[7]=c*m+h*x+d*A,r[2]=u*_+f*y+p*M,r[5]=u*g+f*w+p*S,r[8]=u*m+f*x+p*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-i*r*h+i*o*l+n*r*c-n*a*l}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=h*a-o*c,u=o*l-h*r,f=c*r-a*l,p=e*d+i*u+n*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/p;return t[0]=d*_,t[1]=(n*c-h*i)*_,t[2]=(o*i-n*a)*_,t[3]=u*_,t[4]=(h*e-n*l)*_,t[5]=(n*r-o*e)*_,t[6]=f*_,t[7]=(i*l-c*e)*_,t[8]=(a*e-i*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+t,-n*c,n*l,-n*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return un("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Qu.makeScale(t,e)),this}rotate(t){return un("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Qu.makeRotation(-t)),this}translate(t,e){return un("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Qu.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Qu=new Zt,wp=new Zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Tp=new Zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function h_(){let s={enabled:!0,workingColorSpace:zr,spaces:{},convert:function(n,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===le&&(n.r=Pn(n.r),n.g=Pn(n.g),n.b=Pn(n.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===le&&(n.r=Nr(n.r),n.g=Nr(n.g),n.b=Nr(n.b))),n},workingToColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},colorSpaceToWorking:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===vn?kr:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,a){return n.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,r){return un("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(n,r)},toWorkingColorSpace:function(n,r){return un("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(n,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[zr]:{primaries:t,whitePoint:i,transfer:kr,toXYZ:wp,fromXYZ:Tp,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Be},outputColorSpaceConfig:{drawingBufferColorSpace:Be}},[Be]:{primaries:t,whitePoint:i,transfer:le,toXYZ:wp,fromXYZ:Tp,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Be}}}),s}var te=h_();function Pn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Nr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var fr,go=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{fr===void 0&&(fr=Vr("canvas")),fr.width=t.width,fr.height=t.height;let n=fr.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=fr}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Vr("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),r=n.data;for(let a=0;a<r.length;a++)r[a]=Pn(r[a]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Pn(e[i]/255)*255):e[i]=Pn(e[i]);return{data:e,width:t.width,height:t.height}}else return pt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},u_=0,Ui=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:u_++}),this.uuid=Ei(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let a=0,o=n.length;a<o;a++)n[a].isDataTexture?r.push(td(n[a].image)):r.push(td(n[a]))}else r=td(n);i.url=r}return e||(t.images[this.uuid]=i),i}};function td(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?go.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(pt("Texture: Unable to serialize Texture."),{})}var ah=class extends Ui{constructor(t=null){un('Source: "Source" has been renamed to "TextureSource". Please update your code to use "THREE.TextureSource" instead.'),super(t),this.isSource=!0}},d_=0,ed=new C,Le=class s extends vi{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,i=hi,n=hi,r=Se,a=rn,o=si,l=pi,c=s.DEFAULT_ANISOTROPY,h=vn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:d_++}),this.uuid=Ei(),this.name="",this.source=new Ui(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new q(0,0),this.repeat=new q(1,1),this.center=new q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ed).x}get height(){return this.source.getSize(ed).y}get depth(){return this.source.getSize(ed).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){pt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){pt(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==pl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ur:t.x=t.x-Math.floor(t.x);break;case hi:t.x=t.x<0?0:1;break;case Fr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ur:t.y=t.y-Math.floor(t.y);break;case hi:t.y=t.y<0?0:1;break;case Fr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Le.DEFAULT_IMAGE=null;Le.DEFAULT_MAPPING=pl;Le.DEFAULT_ANISOTROPY=1;var ge=class s{static{s.prototype.isVector4=!0}constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*n+a[12]*r,this.y=a[1]*e+a[5]*i+a[9]*n+a[13]*r,this.z=a[2]*e+a[6]*i+a[10]*n+a[14]*r,this.w=a[3]*e+a[7]*i+a[11]*n+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,r,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],p=l[9],_=l[2],g=l[6],m=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-_)<.01&&Math.abs(p-g)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+_)<.1&&Math.abs(p+g)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let w=(c+1)/2,x=(f+1)/2,M=(m+1)/2,S=(h+u)/4,A=(d+_)/4,v=(p+g)/4;return w>x&&w>M?w<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(w),n=S/i,r=A/i):x>M?x<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(x),i=S/n,r=v/n):M<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(M),i=A/r,n=v/r),this.set(i,n,r,e),this}let y=Math.sqrt((g-p)*(g-p)+(d-_)*(d-_)+(u-h)*(u-h));return Math.abs(y)<.001&&(y=1),this.x=(g-p)/y,this.y=(d-_)/y,this.z=(u-h)/y,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Xt(this.x,t.x,e.x),this.y=Xt(this.y,t.y,e.y),this.z=Xt(this.z,t.z,e.z),this.w=Xt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Xt(this.x,t,e),this.y=Xt(this.y,t,e),this.z=Xt(this.z,t,e),this.w=Xt(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Xt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Hr=class extends vi{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Se,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new ge(0,0,t,e),this.scissorTest=!1,this.viewport=new ge(0,0,t,e),this.textures=[];let n={width:t,height:e,depth:i.depth},r=new Le(n),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Se,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new Ui(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ae=class extends Hr{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},Ls=class extends Le{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=Ie,this.minFilter=Ie,this.wrapR=hi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}},oh=class extends Ae{constructor(t=1,e=1,i=1,n={}){super(t,e,n),this.isWebGLArrayRenderTarget=!0,this.depth=i,this.texture=new Ls(null,t,e,i),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}},Ds=class extends Le{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=Ie,this.minFilter=Ie,this.wrapR=hi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}},lh=class extends Ae{constructor(t=1,e=1,i=1,n={}){super(t,e,n),this.isWebGL3DRenderTarget=!0,this.depth=i,this.texture=new Ds(null,t,e,i),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}},Ht=class s{static{s.prototype.isMatrix4=!0}constructor(t,e,i,n,r,a,o,l,c,h,d,u,f,p,_,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,a,o,l,c,h,d,u,f,p,_,g)}set(t,e,i,n,r,a,o,l,c,h,d,u,f,p,_,g){let m=this.elements;return m[0]=t,m[4]=e,m[8]=i,m[12]=n,m[1]=r,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=h,m[10]=d,m[14]=u,m[3]=f,m[7]=p,m[11]=_,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/pr.setFromMatrixColumn(t,0).length(),r=1/pr.setFromMatrixColumn(t,1).length(),a=1/pr.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,r=t.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let u=a*h,f=a*d,p=o*h,_=o*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=f+p*c,e[5]=u-_*c,e[9]=-o*l,e[2]=_-u*c,e[6]=p+f*c,e[10]=a*l}else if(t.order==="YXZ"){let u=l*h,f=l*d,p=c*h,_=c*d;e[0]=u+_*o,e[4]=p*o-f,e[8]=a*c,e[1]=a*d,e[5]=a*h,e[9]=-o,e[2]=f*o-p,e[6]=_+u*o,e[10]=a*l}else if(t.order==="ZXY"){let u=l*h,f=l*d,p=c*h,_=c*d;e[0]=u-_*o,e[4]=-a*d,e[8]=p+f*o,e[1]=f+p*o,e[5]=a*h,e[9]=_-u*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let u=a*h,f=a*d,p=o*h,_=o*d;e[0]=l*h,e[4]=p*c-f,e[8]=u*c+_,e[1]=l*d,e[5]=_*c+u,e[9]=f*c-p,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let u=a*l,f=a*c,p=o*l,_=o*c;e[0]=l*h,e[4]=_-u*d,e[8]=p*d+f,e[1]=d,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=f*d+p,e[10]=u-_*d}else if(t.order==="XZY"){let u=a*l,f=a*c,p=o*l,_=o*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+_,e[5]=a*h,e[9]=f*d-p,e[2]=p*d-f,e[6]=o*h,e[10]=_*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(f_,t,p_)}lookAt(t,e,i){let n=this.elements;return Si.subVectors(t,e),Si.lengthSq()===0&&(Si.z=1),Si.normalize(),Wn.crossVectors(i,Si),Wn.lengthSq()===0&&(Math.abs(i.z)===1?Si.x+=1e-4:Si.z+=1e-4,Si.normalize(),Wn.crossVectors(i,Si)),Wn.normalize(),mc.crossVectors(Si,Wn),n[0]=Wn.x,n[4]=mc.x,n[8]=Si.x,n[1]=Wn.y,n[5]=mc.y,n[9]=Si.y,n[2]=Wn.z,n[6]=mc.z,n[10]=Si.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],d=i[5],u=i[9],f=i[13],p=i[2],_=i[6],g=i[10],m=i[14],y=i[3],w=i[7],x=i[11],M=i[15],S=n[0],A=n[4],v=n[8],E=n[12],P=n[1],I=n[5],F=n[9],B=n[13],D=n[2],z=n[6],X=n[10],W=n[14],rt=n[3],Y=n[7],tt=n[11],nt=n[15];return r[0]=a*S+o*P+l*D+c*rt,r[4]=a*A+o*I+l*z+c*Y,r[8]=a*v+o*F+l*X+c*tt,r[12]=a*E+o*B+l*W+c*nt,r[1]=h*S+d*P+u*D+f*rt,r[5]=h*A+d*I+u*z+f*Y,r[9]=h*v+d*F+u*X+f*tt,r[13]=h*E+d*B+u*W+f*nt,r[2]=p*S+_*P+g*D+m*rt,r[6]=p*A+_*I+g*z+m*Y,r[10]=p*v+_*F+g*X+m*tt,r[14]=p*E+_*B+g*W+m*nt,r[3]=y*S+w*P+x*D+M*rt,r[7]=y*A+w*I+x*z+M*Y,r[11]=y*v+w*F+x*X+M*tt,r[15]=y*E+w*B+x*W+M*nt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],f=t[14],p=t[3],_=t[7],g=t[11],m=t[15],y=l*f-c*u,w=o*f-c*d,x=o*u-l*d,M=a*f-c*h,S=a*u-l*h,A=a*d-o*h;return e*(_*y-g*w+m*x)-i*(p*y-g*M+m*S)+n*(p*w-_*M+m*A)-r*(p*x-_*S+g*A)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return e*(a*h-o*c)-i*(r*h-o*l)+n*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],f=t[11],p=t[12],_=t[13],g=t[14],m=t[15],y=e*o-i*a,w=e*l-n*a,x=e*c-r*a,M=i*l-n*o,S=i*c-r*o,A=n*c-r*l,v=h*_-d*p,E=h*g-u*p,P=h*m-f*p,I=d*g-u*_,F=d*m-f*_,B=u*m-f*g,D=y*B-w*F+x*I+M*P-S*E+A*v;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let z=1/D;return t[0]=(o*B-l*F+c*I)*z,t[1]=(n*F-i*B-r*I)*z,t[2]=(_*A-g*S+m*M)*z,t[3]=(u*S-d*A-f*M)*z,t[4]=(l*P-a*B-c*E)*z,t[5]=(e*B-n*P+r*E)*z,t[6]=(g*x-p*A-m*w)*z,t[7]=(h*A-u*x+f*w)*z,t[8]=(a*F-o*P+c*v)*z,t[9]=(i*P-e*F-r*v)*z,t[10]=(p*S-_*x+m*y)*z,t[11]=(d*x-h*S-f*y)*z,t[12]=(o*E-a*I-l*v)*z,t[13]=(e*I-i*E+n*v)*z,t[14]=(_*w-p*M-g*y)*z,t[15]=(h*M-d*w+u*y)*z,this}scale(t){let e=this.elements,i=t.x,n=t.y,r=t.z;return e[0]*=i,e[4]*=n,e[8]*=r,e[1]*=i,e[5]*=n,e[9]*=r,e[2]*=i,e[6]*=n,e[10]*=r,e[3]*=i,e[7]*=n,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),r=1-i,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-n*l,c*l+n*o,0,c*o+n*l,h*o+i,h*l-n*a,0,c*l-n*o,h*l+n*a,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,r,a){return this.set(1,i,r,0,t,1,a,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,d=o+o,u=r*c,f=r*h,p=r*d,_=a*h,g=a*d,m=o*d,y=l*c,w=l*h,x=l*d,M=i.x,S=i.y,A=i.z;return n[0]=(1-(_+m))*M,n[1]=(f+x)*M,n[2]=(p-w)*M,n[3]=0,n[4]=(f-x)*S,n[5]=(1-(u+m))*S,n[6]=(g+y)*S,n[7]=0,n[8]=(p+w)*A,n[9]=(g-y)*A,n[10]=(1-(u+_))*A,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let a=pr.set(n[0],n[1],n[2]).length(),o=pr.set(n[4],n[5],n[6]).length(),l=pr.set(n[8],n[9],n[10]).length();r<0&&(a=-a),qi.copy(this);let c=1/a,h=1/o,d=1/l;return qi.elements[0]*=c,qi.elements[1]*=c,qi.elements[2]*=c,qi.elements[4]*=h,qi.elements[5]*=h,qi.elements[6]*=h,qi.elements[8]*=d,qi.elements[9]*=d,qi.elements[10]*=d,e.setFromRotationMatrix(qi),i.x=a,i.y=o,i.z=l,this}makePerspective(t,e,i,n,r,a,o=xi,l=!1){let c=this.elements,h=2*r/(e-t),d=2*r/(i-n),u=(e+t)/(e-t),f=(i+n)/(i-n),p,_;if(l)p=r/(a-r),_=a*r/(a-r);else if(o===xi)p=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===jn)p=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,n,r,a,o=xi,l=!1){let c=this.elements,h=2/(e-t),d=2/(i-n),u=-(e+t)/(e-t),f=-(i+n)/(i-n),p,_;if(l)p=1/(a-r),_=a/(a-r);else if(o===xi)p=-2/(a-r),_=-(a+r)/(a-r);else if(o===jn)p=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}},pr=new C,qi=new Ht,f_=new C(0,0,0),p_=new C(1,1,1),Wn=new C,mc=new C,Si=new C,Ep=new Ht,Ap=new Te,Oi=class s{constructor(t=0,e=0,i=0,n=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,r=n[0],a=n[4],o=n[8],l=n[1],c=n[5],h=n[9],d=n[2],u=n[6],f=n[10];switch(e){case"XYZ":this._y=Math.asin(Xt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Xt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Xt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Xt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Xt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:pt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Ep.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Ep,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Ap.setFromEuler(this),this.setFromQuaternion(Ap,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Oi.DEFAULT_ORDER="XYZ";var Ns=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},m_=0,Cp=new C,mr=new Te,Sn=new Ht,gc=new C,Va=new C,g_=new C,__=new Te,Rp=new C(1,0,0),Pp=new C(0,1,0),Ip=new C(0,0,1),Lp={type:"added"},x_={type:"removed"},gr={type:"childadded",child:null},id={type:"childremoved",child:null},re=class s extends vi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:m_++}),this.uuid=Ei(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new C,e=new Oi,i=new Te,n=new C(1,1,1);function r(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Ht},normalMatrix:{value:new Zt}}),this.matrix=new Ht,this.matrixWorld=new Ht,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ns,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return mr.setFromAxisAngle(t,e),this.quaternion.multiply(mr),this}rotateOnWorldAxis(t,e){return mr.setFromAxisAngle(t,e),this.quaternion.premultiply(mr),this}rotateX(t){return this.rotateOnAxis(Rp,t)}rotateY(t){return this.rotateOnAxis(Pp,t)}rotateZ(t){return this.rotateOnAxis(Ip,t)}translateOnAxis(t,e){return Cp.copy(t).applyQuaternion(this.quaternion),this.position.add(Cp.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Rp,t)}translateY(t){return this.translateOnAxis(Pp,t)}translateZ(t){return this.translateOnAxis(Ip,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Sn.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?gc.copy(t):gc.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),Va.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Sn.lookAt(Va,gc,this.up):Sn.lookAt(gc,Va,this.up),this.quaternion.setFromRotationMatrix(Sn),n&&(Sn.extractRotation(n.matrixWorld),mr.setFromRotationMatrix(Sn),this.quaternion.premultiply(mr.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Dt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Lp),gr.child=t,this.dispatchEvent(gr),gr.child=null):Dt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(x_),id.child=t,this.dispatchEvent(id),id.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Sn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Sn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Sn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Lp),gr.child=t,this.dispatchEvent(gr),gr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Va,t,g_),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Va,__,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*n,r[13]+=i-r[1]*e-r[5]*i-r[9]*n,r[14]+=n-r[2]*e-r[6]*i-r[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(o=>({...o})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));n.material=o}else n.material=r(t.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];n.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),d=a(t.shapes),u=a(t.skeletons),f=a(t.animations),p=a(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),p.length>0&&(i.nodes=p)}return i.object=n,i;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};re.DEFAULT_UP=new C(0,1,0);re.DEFAULT_MATRIX_AUTO_UPDATE=!0;re.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ti=class extends re{constructor(){super(),this.isGroup=!0,this.type="Group"}},v_={type:"move"},Us=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ti,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ti,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ti,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let _ of t.hand.values()){let g=e.getJointPose(_,i),m=this._getHandJoint(c,_);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,p=.005;c.inputState.pinching&&u>f+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=f-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(v_)))}return o!==null&&(o.visible=n!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Ti;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},Cg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xn={h:0,s:0,l:0},_c={h:0,s:0,l:0};function nd(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var at=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Be){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,te.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=te.workingColorSpace){return this.r=t,this.g=e,this.b=i,te.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=te.workingColorSpace){if(t=If(t,1),e=Xt(e,0,1),i=Xt(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,a=2*i-r;this.r=nd(a,r,t+1/3),this.g=nd(a,r,t),this.b=nd(a,r,t-1/3)}return te.colorSpaceToWorking(this,n),this}setStyle(t,e=Be){function i(r){r!==void 0&&parseFloat(r)<1&&pt("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=n[1],o=n[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:pt("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=n[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);pt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Be){let i=Cg[t.toLowerCase()];return i!==void 0?this.setHex(i,e):pt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Pn(t.r),this.g=Pn(t.g),this.b=Pn(t.b),this}copyLinearToSRGB(t){return this.r=Nr(t.r),this.g=Nr(t.g),this.b=Nr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Be){return te.workingToColorSpace(ei.copy(this),t),Math.round(Xt(ei.r*255,0,255))*65536+Math.round(Xt(ei.g*255,0,255))*256+Math.round(Xt(ei.b*255,0,255))}getHexString(t=Be){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=te.workingColorSpace){te.workingToColorSpace(ei.copy(this),e);let i=ei.r,n=ei.g,r=ei.b,a=Math.max(i,n,r),o=Math.min(i,n,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case i:l=(n-r)/d+(n<r?6:0);break;case n:l=(r-i)/d+2;break;case r:l=(i-n)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=te.workingColorSpace){return te.workingToColorSpace(ei.copy(this),e),t.r=ei.r,t.g=ei.g,t.b=ei.b,t}getStyle(t=Be){te.workingToColorSpace(ei.copy(this),t);let e=ei.r,i=ei.g,n=ei.b;return t!==Be?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(Xn),this.setHSL(Xn.h+t,Xn.s+e,Xn.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(Xn),t.getHSL(_c);let i=no(Xn.h,_c.h,e),n=no(Xn.s,_c.s,e),r=no(Xn.l,_c.l,e);return this.setHSL(i,n,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*n,this.g=r[1]*e+r[4]*i+r[7]*n,this.b=r[2]*e+r[5]*i+r[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},ei=new at;at.NAMES=Cg;var _o=class s{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new at(t),this.density=e}clone(){return new s(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}},xo=class s{constructor(t,e=1,i=1e3){this.isFog=!0,this.name="",this.color=new at(t),this.near=e,this.far=i}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Fs=class extends re{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Oi,this.environmentIntensity=1,this.environmentRotation=new Oi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Yi=new C,wn=new C,sd=new C,Tn=new C,_r=new C,xr=new C,Dp=new C,rd=new C,ad=new C,od=new C,ld=new ge,cd=new ge,hd=new ge,Ji=class s{constructor(t=new C,e=new C,i=new C){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),Yi.subVectors(t,e),n.cross(Yi);let r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(t,e,i,n,r){Yi.subVectors(n,e),wn.subVectors(i,e),sd.subVectors(t,e);let a=Yi.dot(Yi),o=Yi.dot(wn),l=Yi.dot(sd),c=wn.dot(wn),h=wn.dot(sd),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let u=1/d,f=(c*l-o*h)*u,p=(a*h-o*l)*u;return r.set(1-f-p,p,f)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,Tn)===null?!1:Tn.x>=0&&Tn.y>=0&&Tn.x+Tn.y<=1}static getInterpolation(t,e,i,n,r,a,o,l){return this.getBarycoord(t,e,i,n,Tn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Tn.x),l.addScaledVector(a,Tn.y),l.addScaledVector(o,Tn.z),l)}static getInterpolatedAttribute(t,e,i,n,r,a){return ld.setScalar(0),cd.setScalar(0),hd.setScalar(0),ld.fromBufferAttribute(t,e),cd.fromBufferAttribute(t,i),hd.fromBufferAttribute(t,n),a.setScalar(0),a.addScaledVector(ld,r.x),a.addScaledVector(cd,r.y),a.addScaledVector(hd,r.z),a}static isFrontFacing(t,e,i,n){return Yi.subVectors(i,e),wn.subVectors(t,e),Yi.cross(wn).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Yi.subVectors(this.c,this.b),wn.subVectors(this.a,this.b),Yi.cross(wn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,r){return s.getInterpolation(t,this.a,this.b,this.c,e,i,n,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,r=this.c,a,o;_r.subVectors(n,i),xr.subVectors(r,i),rd.subVectors(t,i);let l=_r.dot(rd),c=xr.dot(rd);if(l<=0&&c<=0)return e.copy(i);ad.subVectors(t,n);let h=_r.dot(ad),d=xr.dot(ad);if(h>=0&&d<=h)return e.copy(n);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(i).addScaledVector(_r,a);od.subVectors(t,r);let f=_r.dot(od),p=xr.dot(od);if(p>=0&&f<=p)return e.copy(r);let _=f*c-l*p;if(_<=0&&c>=0&&p<=0)return o=c/(c-p),e.copy(i).addScaledVector(xr,o);let g=h*p-f*d;if(g<=0&&d-h>=0&&f-p>=0)return Dp.subVectors(r,n),o=(d-h)/(d-h+(f-p)),e.copy(n).addScaledVector(Dp,o);let m=1/(g+_+u);return a=_*m,o=u*m,e.copy(i).addScaledVector(_r,a).addScaledVector(xr,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},He=class{constructor(t=new C(1/0,1/0,1/0),e=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Zi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Zi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=Zi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Zi):Zi.fromBufferAttribute(r,a),Zi.applyMatrix4(t.matrixWorld),this.expandByPoint(Zi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),xc.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),xc.copy(i.boundingBox)),xc.applyMatrix4(t.matrixWorld),this.union(xc)}let n=t.children;for(let r=0,a=n.length;r<a;r++)this.expandByObject(n[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Zi),Zi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ga),vc.subVectors(this.max,Ga),vr.subVectors(t.a,Ga),yr.subVectors(t.b,Ga),Mr.subVectors(t.c,Ga),qn.subVectors(yr,vr),Yn.subVectors(Mr,yr),_s.subVectors(vr,Mr);let e=[0,-qn.z,qn.y,0,-Yn.z,Yn.y,0,-_s.z,_s.y,qn.z,0,-qn.x,Yn.z,0,-Yn.x,_s.z,0,-_s.x,-qn.y,qn.x,0,-Yn.y,Yn.x,0,-_s.y,_s.x,0];return!ud(e,vr,yr,Mr,vc)||(e=[1,0,0,0,1,0,0,0,1],!ud(e,vr,yr,Mr,vc))?!1:(yc.crossVectors(qn,Yn),e=[yc.x,yc.y,yc.z],ud(e,vr,yr,Mr,vc))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Zi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Zi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(En[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),En[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),En[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),En[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),En[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),En[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),En[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),En[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(En),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},En=[new C,new C,new C,new C,new C,new C,new C,new C],Zi=new C,xc=new He,vr=new C,yr=new C,Mr=new C,qn=new C,Yn=new C,_s=new C,Ga=new C,vc=new C,yc=new C,xs=new C;function ud(s,t,e,i,n){for(let r=0,a=s.length-3;r<=a;r+=3){xs.fromArray(s,r);let o=n.x*Math.abs(xs.x)+n.y*Math.abs(xs.y)+n.z*Math.abs(xs.z),l=t.dot(xs),c=e.dot(xs),h=i.dot(xs);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Rn=y_();function y_(){let s=new ArrayBuffer(4),t=new Float32Array(s),e=new Uint32Array(s),i=new Uint32Array(512),n=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(i[l]=0,i[l|256]=32768,n[l]=24,n[l|256]=24):c<-14?(i[l]=1024>>-c-14,i[l|256]=1024>>-c-14|32768,n[l]=-c-1,n[l|256]=-c-1):c<=15?(i[l]=c+15<<10,i[l|256]=c+15<<10|32768,n[l]=13,n[l|256]=13):c<128?(i[l]=31744,i[l|256]=64512,n[l]=24,n[l|256]=24):(i[l]=31744,i[l|256]=64512,n[l]=13,n[l|256]=13)}let r=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;(c&8388608)===0;)c<<=1,h-=8388608;c&=-8388609,h+=947912704,r[l]=c|h}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:t,uint32View:e,baseTable:i,shiftTable:n,mantissaTable:r,exponentTable:a,offsetTable:o}}function gi(s){Math.abs(s)>65504&&pt("DataUtils.toHalfFloat(): Value out of range."),s=Xt(s,-65504,65504),Rn.floatView[0]=s;let t=Rn.uint32View[0],e=t>>23&511;return Rn.baseTable[e]+((t&8388607)>>Rn.shiftTable[e])}function Qa(s){let t=s>>10;return Rn.uint32View[0]=Rn.mantissaTable[Rn.offsetTable[t]+(s&1023)]+Rn.exponentTable[t],Rn.floatView[0]}var ch=class{static toHalfFloat(t){return gi(t)}static fromHalfFloat(t){return Qa(t)}},Oe=new C,Mc=new q,M_=0,he=class extends vi{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:M_++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=tc,this.updateRanges=[],this.gpuType=ni,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Mc.fromBufferAttribute(this,e),Mc.applyMatrix3(t),this.setXY(e,Mc.x,Mc.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyMatrix3(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyMatrix4(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyNormalMatrix(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.transformDirection(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=ci(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Kt(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ci(e,this.array)),e}setX(t,e){return this.normalized&&(e=Kt(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ci(e,this.array)),e}setY(t,e){return this.normalized&&(e=Kt(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ci(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Kt(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ci(e,this.array)),e}setW(t,e){return this.normalized&&(e=Kt(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Kt(e,this.array),i=Kt(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=Kt(e,this.array),i=Kt(i,this.array),n=Kt(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t*=this.itemSize,this.normalized&&(e=Kt(e,this.array),i=Kt(i,this.array),n=Kt(n,this.array),r=Kt(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}},hh=class extends he{constructor(t,e,i){super(new Int8Array(t),e,i)}},uh=class extends he{constructor(t,e,i){super(new Uint8Array(t),e,i)}},dh=class extends he{constructor(t,e,i){super(new Uint8ClampedArray(t),e,i)}},fh=class extends he{constructor(t,e,i){super(new Int16Array(t),e,i)}},Wr=class extends he{constructor(t,e,i){super(new Uint16Array(t),e,i)}},ph=class extends he{constructor(t,e,i){super(new Int32Array(t),e,i)}},Xr=class extends he{constructor(t,e,i){super(new Uint32Array(t),e,i)}},mh=class extends he{constructor(t,e,i){super(new Uint16Array(t),e,i),this.isFloat16BufferAttribute=!0}getX(t){let e=Qa(this.array[t*this.itemSize]);return this.normalized&&(e=ci(e,this.array)),e}setX(t,e){return this.normalized&&(e=Kt(e,this.array)),this.array[t*this.itemSize]=gi(e),this}getY(t){let e=Qa(this.array[t*this.itemSize+1]);return this.normalized&&(e=ci(e,this.array)),e}setY(t,e){return this.normalized&&(e=Kt(e,this.array)),this.array[t*this.itemSize+1]=gi(e),this}getZ(t){let e=Qa(this.array[t*this.itemSize+2]);return this.normalized&&(e=ci(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Kt(e,this.array)),this.array[t*this.itemSize+2]=gi(e),this}getW(t){let e=Qa(this.array[t*this.itemSize+3]);return this.normalized&&(e=ci(e,this.array)),e}setW(t,e){return this.normalized&&(e=Kt(e,this.array)),this.array[t*this.itemSize+3]=gi(e),this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Kt(e,this.array),i=Kt(i,this.array)),this.array[t+0]=gi(e),this.array[t+1]=gi(i),this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=Kt(e,this.array),i=Kt(i,this.array),n=Kt(n,this.array)),this.array[t+0]=gi(e),this.array[t+1]=gi(i),this.array[t+2]=gi(n),this}setXYZW(t,e,i,n,r){return t*=this.itemSize,this.normalized&&(e=Kt(e,this.array),i=Kt(i,this.array),n=Kt(n,this.array),r=Kt(r,this.array)),this.array[t+0]=gi(e),this.array[t+1]=gi(i),this.array[t+2]=gi(n),this.array[t+3]=gi(r),this}},vt=class extends he{constructor(t,e,i){super(new Float32Array(t),e,i)}},b_=new He,Ha=new C,dd=new C,ke=class{constructor(t=new C,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):b_.setFromPoints(t).getCenter(i);let n=0;for(let r=0,a=t.length;r<a;r++)n=Math.max(n,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ha.subVectors(t,this.center);let e=Ha.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(Ha,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(dd.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ha.copy(t.center).add(dd)),this.expandByPoint(Ha.copy(t.center).sub(dd))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},S_=0,Ni=new Ht,fd=new re,br=new C,wi=new He,Wa=new He,Ye=new C,kt=class s extends vi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:S_++}),this.uuid=Ei(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(q0(t)?Xr:Wr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Zt().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Ni.makeRotationFromQuaternion(t),this.applyMatrix4(Ni),this}rotateX(t){return Ni.makeRotationX(t),this.applyMatrix4(Ni),this}rotateY(t){return Ni.makeRotationY(t),this.applyMatrix4(Ni),this}rotateZ(t){return Ni.makeRotationZ(t),this.applyMatrix4(Ni),this}translate(t,e,i){return Ni.makeTranslation(t,e,i),this.applyMatrix4(Ni),this}scale(t,e,i){return Ni.makeScale(t,e,i),this.applyMatrix4(Ni),this}lookAt(t){return fd.lookAt(t),fd.updateMatrix(),this.applyMatrix4(fd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(br).negate(),this.translate(br.x,br.y,br.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,r=t.length;n<r;n++){let a=t[n];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new vt(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&pt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new He);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Dt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let r=e[i];wi.setFromBufferAttribute(r),this.morphTargetsRelative?(Ye.addVectors(this.boundingBox.min,wi.min),this.boundingBox.expandByPoint(Ye),Ye.addVectors(this.boundingBox.max,wi.max),this.boundingBox.expandByPoint(Ye)):(this.boundingBox.expandByPoint(wi.min),this.boundingBox.expandByPoint(wi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Dt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ke);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Dt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(t){let i=this.boundingSphere.center;if(wi.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];Wa.setFromBufferAttribute(o),this.morphTargetsRelative?(Ye.addVectors(wi.min,Wa.min),wi.expandByPoint(Ye),Ye.addVectors(wi.max,Wa.max),wi.expandByPoint(Ye)):(wi.expandByPoint(Wa.min),wi.expandByPoint(Wa.max))}wi.getCenter(i);let n=0;for(let r=0,a=t.count;r<a;r++)Ye.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(Ye));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Ye.fromBufferAttribute(o,c),l&&(br.fromBufferAttribute(t,c),Ye.add(br)),n=Math.max(n,i.distanceToSquared(Ye))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&Dt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Dt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new he(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let v=0;v<i.count;v++)o[v]=new C,l[v]=new C;let c=new C,h=new C,d=new C,u=new q,f=new q,p=new q,_=new C,g=new C;function m(v,E,P){c.fromBufferAttribute(i,v),h.fromBufferAttribute(i,E),d.fromBufferAttribute(i,P),u.fromBufferAttribute(r,v),f.fromBufferAttribute(r,E),p.fromBufferAttribute(r,P),h.sub(c),d.sub(c),f.sub(u),p.sub(u);let I=1/(f.x*p.y-p.x*f.y);isFinite(I)&&(_.copy(h).multiplyScalar(p.y).addScaledVector(d,-f.y).multiplyScalar(I),g.copy(d).multiplyScalar(f.x).addScaledVector(h,-p.x).multiplyScalar(I),o[v].add(_),o[E].add(_),o[P].add(_),l[v].add(g),l[E].add(g),l[P].add(g))}let y=this.groups;y.length===0&&(y=[{start:0,count:t.count}]);for(let v=0,E=y.length;v<E;++v){let P=y[v],I=P.start,F=P.count;for(let B=I,D=I+F;B<D;B+=3)m(t.getX(B+0),t.getX(B+1),t.getX(B+2))}let w=new C,x=new C,M=new C,S=new C;function A(v){M.fromBufferAttribute(n,v),S.copy(M);let E=o[v];w.copy(E),w.sub(M.multiplyScalar(M.dot(E))).normalize(),x.crossVectors(S,E);let I=x.dot(l[v])<0?-1:1;a.setXYZW(v,w.x,w.y,w.z,I)}for(let v=0,E=y.length;v<E;++v){let P=y[v],I=P.start,F=P.count;for(let B=I,D=I+F;B<D;B+=3)A(t.getX(B+0)),A(t.getX(B+1)),A(t.getX(B+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new he(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);let n=new C,r=new C,a=new C,o=new C,l=new C,c=new C,h=new C,d=new C;if(t)for(let u=0,f=t.count;u<f;u+=3){let p=t.getX(u+0),_=t.getX(u+1),g=t.getX(u+2);n.fromBufferAttribute(e,p),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,g),h.subVectors(a,r),d.subVectors(n,r),h.cross(d),o.fromBufferAttribute(i,p),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,g),o.add(h),l.add(h),c.add(h),i.setXYZ(p,o.x,o.y,o.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,f=e.count;u<f;u+=3)n.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),h.subVectors(a,r),d.subVectors(n,r),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Ye.fromBufferAttribute(t,e),Ye.normalize(),t.setXYZ(e,Ye.x,Ye.y,Ye.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),f=0,p=0;for(let _=0,g=l.length;_<g;_++){o.isInterleavedBufferAttribute?f=l[_]*o.data.stride+o.offset:f=l[_]*h;for(let m=0;m<h;m++)u[p++]=c[f++]}return new he(u,h,d)}if(this.index===null)return pt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,i=this.index.array,n=this.attributes;for(let o in n){let l=n[o],c=t(l,i);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],f=t(u,i);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let n={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d];h.push(f.toJSON(t.data))}h.length>0&&(n[l]=h,r=!0)}r&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Os=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=tc,this.updateRanges=[],this.version=0,this.uuid=Ei()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let n=0,r=this.stride;n<r;n++)this.array[t+n]=e.array[i+n];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ei()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ei()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},li=new C,ts=class s{constructor(t,e,i,n=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=n}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)li.fromBufferAttribute(this,e),li.applyMatrix4(t),this.setXYZ(e,li.x,li.y,li.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)li.fromBufferAttribute(this,e),li.applyNormalMatrix(t),this.setXYZ(e,li.x,li.y,li.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)li.fromBufferAttribute(this,e),li.transformDirection(t),this.setXYZ(e,li.x,li.y,li.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=ci(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Kt(i,this.array)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=Kt(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Kt(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Kt(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Kt(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=ci(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=ci(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=ci(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=ci(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=Kt(e,this.array),i=Kt(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Kt(e,this.array),i=Kt(i,this.array),n=Kt(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Kt(e,this.array),i=Kt(i,this.array),n=Kt(n,this.array),r=Kt(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this.data.array[t+3]=r,this}clone(t){if(t===void 0){Gr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[n+r])}return new he(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new s(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){Gr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[n+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},pd=new C,w_=new C,T_=new Zt,_i=class{constructor(t=new C(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=pd.subVectors(i,e).cross(w_.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(pd),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(n,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||T_.getNormalMatrix(t),n=this.coplanarPoint(pd).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},E_=0,Ve=class extends vi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:E_++}),this.uuid=Ei(),this.name="",this.type="Material",this.blending=er,this.side=Un,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=du,this.blendDst=fu,this.blendEquation=cs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new at(0,0,0),this.blendAlpha=0,this.depthFunc=Ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Sf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=io,this.stencilZFail=io,this.stencilZPass=io,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){pt(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){pt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=n(t.textures),a=n(t.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new at().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new _i().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new q().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new q().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},es=class extends Ve{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new at(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Sr,Xa=new C,wr=new C,Tr=new C,Er=new q,qa=new q,Rg=new Ht,bc=new C,Ya=new C,Sc=new C,Np=new q,md=new q,Up=new q,Bs=class extends re{constructor(t=new es){if(super(),this.isSprite=!0,this.type="Sprite",Sr===void 0){Sr=new kt;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Os(e,5);Sr.setIndex([0,1,2,0,2,3]),Sr.setAttribute("position",new ts(i,3,0,!1)),Sr.setAttribute("uv",new ts(i,2,3,!1))}this.geometry=Sr,this.material=t,this.center=new q(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&Dt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),wr.setFromMatrixScale(this.matrixWorld),Rg.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Tr.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&wr.multiplyScalar(-Tr.z);let i=this.material.rotation,n,r;i!==0&&(r=Math.cos(i),n=Math.sin(i));let a=this.center;wc(bc.set(-.5,-.5,0),Tr,a,wr,n,r),wc(Ya.set(.5,-.5,0),Tr,a,wr,n,r),wc(Sc.set(.5,.5,0),Tr,a,wr,n,r),Np.set(0,0),md.set(1,0),Up.set(1,1);let o=t.ray.intersectTriangle(bc,Ya,Sc,!1,Xa);if(o===null&&(wc(Ya.set(-.5,.5,0),Tr,a,wr,n,r),md.set(0,1),o=t.ray.intersectTriangle(bc,Sc,Ya,!1,Xa),o===null))return;let l=t.ray.origin.distanceTo(Xa);l<t.near||l>t.far||e.push({distance:l,point:Xa.clone(),uv:Ji.getInterpolation(Xa,bc,Ya,Sc,Np,md,Up,new q),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function wc(s,t,e,i,n,r){Er.subVectors(s,e).addScalar(.5).multiply(i),n!==void 0?(qa.x=r*Er.x-n*Er.y,qa.y=n*Er.x+r*Er.y):qa.copy(Er),s.copy(t),s.x+=qa.x,s.y+=qa.y,s.applyMatrix4(Rg)}var Tc=new C,Fp=new C,vo=class extends re{constructor(){super(),this.isLOD=!0,this._currentLevel=0,this.type="LOD",Object.defineProperties(this,{levels:{enumerable:!0,value:[]}}),this.autoUpdate=!0}copy(t){super.copy(t,!1);let e=t.levels;for(let i=0,n=e.length;i<n;i++){let r=e[i];this.addLevel(r.object.clone(),r.distance,r.hysteresis)}return this.autoUpdate=t.autoUpdate,this}addLevel(t,e=0,i=0){e=Math.abs(e);let n=this.levels,r;for(r=0;r<n.length&&!(e<n[r].distance);r++);return n.splice(r,0,{distance:e,hysteresis:i,object:t}),this.add(t),this}removeLevel(t){let e=this.levels;for(let i=0;i<e.length;i++)if(e[i].distance===t){let n=e.splice(i,1);return this.remove(n[0].object),!0}return!1}getCurrentLevel(){return this._currentLevel}getObjectForDistance(t){let e=this.levels;if(e.length>0){let i,n;for(i=1,n=e.length;i<n;i++){let r=e[i].distance;if(e[i].object.visible&&(r-=r*e[i].hysteresis),t<r)break}return e[i-1].object}return null}raycast(t,e){if(this.levels.length>0){Tc.setFromMatrixPosition(this.matrixWorld);let n=t.ray.origin.distanceTo(Tc);this.getObjectForDistance(n).raycast(t,e)}}update(t){let e=this.levels;if(e.length>1){Tc.setFromMatrixPosition(t.matrixWorld),Fp.setFromMatrixPosition(this.matrixWorld);let i=Tc.distanceTo(Fp)/t.zoom;e[0].object.visible=!0;let n,r;for(n=1,r=e.length;n<r;n++){let a=e[n].distance;if(e[n].object.visible&&(a-=a*e[n].hysteresis),i>=a)e[n-1].object.visible=!1,e[n].object.visible=!0;else break}for(this._currentLevel=n-1;n<r;n++)e[n].object.visible=!1}}toJSON(t){let e=super.toJSON(t);e.object.autoUpdate=this.autoUpdate,e.object.levels=[];let i=this.levels;for(let n=0,r=i.length;n<r;n++){let a=i[n];e.object.levels.push({object:a.object.uuid,distance:a.distance,hysteresis:a.hysteresis})}return e}},An=new C,gd=new C,Ec=new C,Ac=new C,Qi=class{constructor(t=new C,e=new C(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,An)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=An.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(An.copy(this.origin).addScaledVector(this.direction,e),An.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){gd.copy(t).add(e).multiplyScalar(.5),Ec.copy(e).sub(t).normalize(),Ac.copy(this.origin).sub(gd);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Ec),o=Ac.dot(this.direction),l=-Ac.dot(Ec),c=Ac.lengthSq(),h=Math.abs(1-a*a),d,u,f,p;if(h>0)if(d=a*l-o,u=a*o-l,p=r*h,d>=0)if(u>=-p)if(u<=p){let _=1/h;d*=_,u*=_,f=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u<=-p?(d=Math.max(0,-(-a*r+o)),u=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c):u<=p?(d=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(d=Math.max(0,-(a*r+o)),u=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c);else u=a>0?-r:r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(gd).addScaledVector(Ec,u),f}intersectSphere(t,e){if(t.radius<0)return null;An.subVectors(t.center,this.origin);let i=An.dot(this.direction),n=An.dot(An)-i*i,r=t.radius*t.radius;if(n>r)return null;let a=Math.sqrt(r-n),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,n=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,n=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,a=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,a=(t.min.y-u.y)*h),i>a||r>n||((r>i||isNaN(i))&&(i=r),(a<n||isNaN(n))&&(n=a),d>=0?(o=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(o=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),i>l||o>n)||((o>i||i!==i)&&(i=o),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,An)!==null}intersectTriangle(t,e,i,n,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,d=t.x-a.x,u=t.y-a.y,f=t.z-a.z,p=e.x-a.x,_=e.y-a.y,g=e.z-a.z,m=i.x-a.x,y=i.y-a.y,w=i.z-a.z,x=Math.abs(l),M=Math.abs(c),S=Math.abs(h),A,v,E,P,I,F,B,D,z,X,W,rt;if(x>=M&&x>=S?(E=l,F=d,z=p,rt=m,l>=0?(A=c,v=h,P=u,I=f,B=_,D=g,X=y,W=w):(A=h,v=c,P=f,I=u,B=g,D=_,X=w,W=y)):M>=S?(E=c,F=u,z=_,rt=y,c>=0?(A=h,v=l,P=f,I=d,B=g,D=p,X=w,W=m):(A=l,v=h,P=d,I=f,B=p,D=g,X=m,W=w)):(E=h,F=f,z=g,rt=w,h>=0?(A=l,v=c,P=d,I=u,B=p,D=_,X=m,W=y):(A=c,v=l,P=u,I=d,B=_,D=p,X=y,W=m)),E===0)return null;let Y=A/E,tt=v/E,nt=1/E,Ut=P-Y*F,Rt=I-tt*F,ue=B-Y*z,ie=D-tt*z,ae=X-Y*rt,J=W-tt*rt,et=ae*ie-J*ue,bt=Ut*J-Rt*ae,Wt=ue*Rt-ie*Ut;if(n){if(et<0||bt<0||Wt<0)return null}else if((et<0||bt<0||Wt<0)&&(et>0||bt>0||Wt>0))return null;let Et=et+bt+Wt;if(Et===0)return null;let qt=nt*(et*F+bt*z+Wt*rt);return(Et>0?qt<0:qt>0)?null:this.at(qt/Et,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ce=class extends Ve{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new at(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.combine=pa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Op=new Ht,vs=new Qi,Cc=new ke,Bp=new C,Rc=new C,Pc=new C,Ic=new C,_d=new C,Lc=new C,zp=new C,Dc=new C,ee=class extends re{constructor(t=new kt,e=new ce){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let o=this.morphTargetInfluences;if(r&&o){Lc.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],d=r[l];h!==0&&(_d.fromBufferAttribute(d,t),a?Lc.addScaledVector(_d,h):Lc.addScaledVector(_d.sub(e),h))}e.add(Lc)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Cc.copy(i.boundingSphere),Cc.applyMatrix4(r),vs.copy(t.ray).recast(t.near),!(Cc.containsPoint(vs.origin)===!1&&(vs.intersectSphere(Cc,Bp)===null||vs.origin.distanceToSquared(Bp)>(t.far-t.near)**2))&&(Op.copy(r).invert(),vs.copy(t.ray).applyMatrix4(Op),!(i.boundingBox!==null&&vs.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,vs)))}_computeIntersections(t,e,i){let n,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,_=u.length;p<_;p++){let g=u[p],m=a[g.materialIndex],y=Math.max(g.start,f.start),w=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let x=y,M=w;x<M;x+=3){let S=o.getX(x),A=o.getX(x+1),v=o.getX(x+2);n=Nc(this,m,t,i,c,h,d,S,A,v),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=g.materialIndex,e.push(n))}}else{let p=Math.max(0,f.start),_=Math.min(o.count,f.start+f.count);for(let g=p,m=_;g<m;g+=3){let y=o.getX(g),w=o.getX(g+1),x=o.getX(g+2);n=Nc(this,a,t,i,c,h,d,y,w,x),n&&(n.faceIndex=Math.floor(g/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(a))for(let p=0,_=u.length;p<_;p++){let g=u[p],m=a[g.materialIndex],y=Math.max(g.start,f.start),w=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let x=y,M=w;x<M;x+=3){let S=x,A=x+1,v=x+2;n=Nc(this,m,t,i,c,h,d,S,A,v),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=g.materialIndex,e.push(n))}}else{let p=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let g=p,m=_;g<m;g+=3){let y=g,w=g+1,x=g+2;n=Nc(this,a,t,i,c,h,d,y,w,x),n&&(n.faceIndex=Math.floor(g/3),e.push(n))}}}};function A_(s,t,e,i,n,r,a,o){let l;if(t.side===ri?l=i.intersectTriangle(a,r,n,!0,o):l=i.intersectTriangle(n,r,a,t.side===Un,o),l===null)return null;Dc.copy(o),Dc.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(Dc);return c<e.near||c>e.far?null:{distance:c,point:Dc.clone(),object:s}}function Nc(s,t,e,i,n,r,a,o,l,c){s.getVertexPosition(o,Rc),s.getVertexPosition(l,Pc),s.getVertexPosition(c,Ic);let h=A_(s,t,e,i,Rc,Pc,Ic,zp);if(h){let d=new C;Ji.getBarycoord(zp,Rc,Pc,Ic,d),n&&(h.uv=Ji.getInterpolatedAttribute(n,o,l,c,d,new q)),r&&(h.uv1=Ji.getInterpolatedAttribute(r,o,l,c,d,new q)),a&&(h.normal=Ji.getInterpolatedAttribute(a,o,l,c,d,new C),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new C,materialIndex:0};Ji.getNormal(Rc,Pc,Ic,u.normal),h.face=u,h.barycoord=d}return h}var Za=new ge,kp=new ge,Vp=new ge,C_=new ge,Gp=new Ht,Uc=new C,xd=new ke,Hp=new Ht,vd=new Qi,yo=class extends ee{constructor(t,e){super(t,e),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=sh,this.bindMatrix=new Ht,this.bindMatrixInverse=new Ht,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let t=this.geometry;this.boundingBox===null&&(this.boundingBox=new He),this.boundingBox.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,Uc),this.boundingBox.expandByPoint(Uc)}computeBoundingSphere(){let t=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new ke),this.boundingSphere.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,Uc),this.boundingSphere.expandByPoint(Uc)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}raycast(t,e){let i=this.material,n=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xd.copy(this.boundingSphere),xd.applyMatrix4(n),t.ray.intersectsSphere(xd)!==!1&&(Hp.copy(n).invert(),vd.copy(t.ray).applyMatrix4(Hp),!(this.boundingBox!==null&&vd.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(t,e,vd)))}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){this.skeleton=t,e===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld),this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let t=new ge,e=this.geometry.attributes.skinWeight;for(let i=0,n=e.count;i<n;i++){t.fromBufferAttribute(e,i);let r=1/t.manhattanLength();r!==1/0?t.multiplyScalar(r):t.set(1,0,0,0),e.setXYZW(i,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){super.updateMatrixWorld(t),this.bindMode===sh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===_f?this.bindMatrixInverse.copy(this.bindMatrix).invert():pt("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){let i=this.skeleton,n=this.geometry;kp.fromBufferAttribute(n.attributes.skinIndex,t),Vp.fromBufferAttribute(n.attributes.skinWeight,t),e.isVector4?(Za.copy(e),e.set(0,0,0,0)):(Za.set(...e,1),e.set(0,0,0)),Za.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=Vp.getComponent(r);if(a!==0){let o=kp.getComponent(r);Gp.multiplyMatrices(i.bones[o].matrixWorld,i.boneInverses[o]),e.addScaledVector(C_.copy(Za).applyMatrix4(Gp),a)}}return e.isVector4&&(e.w=Za.w),e.applyMatrix4(this.bindMatrixInverse)}},qr=class extends re{constructor(){super(),this.isBone=!0,this.type="Bone"}},ui=class extends Le{constructor(t=null,e=1,i=1,n,r,a,o,l,c=Ie,h=Ie,d,u){super(null,a,o,l,c,h,n,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Wp=new Ht,R_=new Ht,Mo=class s{constructor(t=[],e=[]){this.uuid=Ei(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){pt("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,n=this.bones.length;i<n;i++)this.boneInverses.push(new Ht)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){let i=new Ht;this.bones[t]&&i.copy(this.bones[t].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];i&&i.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){let t=this.bones,e=this.boneInverses,i=this.boneMatrices,n=this.boneTexture;for(let r=0,a=t.length;r<a;r++){let o=t[r]?t[r].matrixWorld:R_;Wp.multiplyMatrices(o,e[r]),Wp.toArray(i,r*16)}n!==null&&(n.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4);e.set(this.boneMatrices);let i=new ui(e,t,t,si,ni);return i.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=i,this}getBoneByName(t){for(let e=0,i=this.bones.length;e<i;e++){let n=this.bones[e];if(n.name===t)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(t,e){this.uuid=t.uuid;for(let i=0,n=t.bones.length;i<n;i++){let r=t.bones[i],a=e[r];a===void 0&&(pt("Skeleton: No bone found with UUID:",r),a=new qr),this.bones.push(a),this.boneInverses.push(new Ht().fromArray(t.boneInverses[i]))}return this.init(),this}toJSON(){let t={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let e=this.bones,i=this.boneInverses;for(let n=0,r=e.length;n<r;n++){let a=e[n];t.bones.push(a.uuid);let o=i[n];t.boneInverses.push(o.toArray())}return t}},In=class extends he{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Ar=new Ht,Xp=new Ht,Fc=[],qp=new He,P_=new Ht,$a=new ee,Ja=new ke,De=class extends ee{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new In(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,P_)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new He),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Ar),qp.copy(t.boundingBox).applyMatrix4(Ar),this.boundingBox.union(qp)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new ke),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Ar),Ja.copy(t.boundingSphere).applyMatrix4(Ar),this.boundingSphere.union(Ja)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,a=t*r+1;for(let o=0;o<i.length;o++)i[o]=n[a+o]}raycast(t,e){let i=this.matrixWorld,n=this.count;if($a.geometry=this.geometry,$a.material=this.material,$a.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ja.copy(this.boundingSphere),Ja.applyMatrix4(i),t.ray.intersectsSphere(Ja)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,Ar),Xp.multiplyMatrices(i,Ar),$a.matrixWorld=Xp,$a.raycast(t,Fc);for(let a=0,o=Fc.length;a<o;a++){let l=Fc[a];l.instanceId=r,l.object=this,e.push(l)}Fc.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new In(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new ui(new Float32Array(n*this.count),n,this.count,xl,ni));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<i.length;c++)a+=i[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=n*t;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ys=new ke,I_=new q(.5,.5),Oc=new C,dn=class{constructor(t=new _i,e=new _i,i=new _i,n=new _i,r=new _i,a=new _i){this.planes=[t,e,i,n,r,a]}set(t,e,i,n,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(n),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=xi,i=!1){let n=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],f=r[7],p=r[8],_=r[9],g=r[10],m=r[11],y=r[12],w=r[13],x=r[14],M=r[15];if(n[0].setComponents(c-a,f-h,m-p,M-y).normalize(),n[1].setComponents(c+a,f+h,m+p,M+y).normalize(),n[2].setComponents(c+o,f+d,m+_,M+w).normalize(),n[3].setComponents(c-o,f-d,m-_,M-w).normalize(),i)n[4].setComponents(l,u,g,x).normalize(),n[5].setComponents(c-l,f-u,m-g,M-x).normalize();else if(n[4].setComponents(c-l,f-u,m-g,M-x).normalize(),e===xi)n[5].setComponents(c+l,f+u,m+g,M+x).normalize();else if(e===jn)n[5].setComponents(l,u,g,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ys.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ys.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ys)}intersectsSprite(t){ys.center.set(0,0,0);let e=I_.distanceTo(t.center);return ys.radius=.7071067811865476+e,ys.applyMatrix4(t.matrixWorld),this.intersectsSphere(ys)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(Oc.x=n.normal.x>0?t.max.x:t.min.x,Oc.y=n.normal.y>0?t.max.y:t.min.y,Oc.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(Oc)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Yp=new Ht,bo=class s{constructor(){this.coordinateSystem=xi,this._frustums=[],this._count=0}setFromArrayCamera(t){let e=t.cameras,i=this._frustums;for(let n=0;n<e.length;n++){let r=e[n];Yp.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),i[n]===void 0&&(i[n]=new dn),i[n].setFromProjectionMatrix(Yp,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}intersectsObject(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsObject(t))return!0;return!1}intersectsSprite(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSprite(t))return!0;return!1}intersectsSphere(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSphere(t))return!0;return!1}intersectsBox(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsBox(t))return!0;return!1}containsPoint(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;let e=this._frustums,i=t._frustums;for(let n=0;n<t._count;n++)e[n]===void 0&&(e[n]=new dn),e[n].copy(i[n]);return this._count=t._count,this}clone(){return new s().copy(this)}};function yd(s,t){return s-t}function L_(s,t){return s.z-t.z}function D_(s,t){return t.z-s.z}var Nd=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(t,e,i,n){let r=this.pool,a=this.list;this.index>=r.length&&r.push({start:-1,count:-1,z:-1,index:-1});let o=r[this.index];a.push(o),this.index++,o.start=t,o.count=e,o.z=i,o.index=n}reset(){this.list.length=0,this.index=0}},mi=new Ht,N_=new at(1,1,1),U_=new dn,F_=new bo,Bc=new He,Ms=new ke,Ka=new C,Zp=new C,O_=new C,Md=new Nd,ii=new ee,zc=[];function B_(s,t,e=0){let i=t.itemSize;if(s.isInterleavedBufferAttribute||s.array.constructor!==t.array.constructor){let n=s.count;for(let r=0;r<n;r++)for(let a=0;a<i;a++)t.setComponent(r+e,a,s.getComponent(r,a))}else t.array.set(s.array,e*i);t.needsUpdate=!0}function bs(s,t){if(s.constructor!==t.constructor){let e=Math.min(s.length,t.length);for(let i=0;i<e;i++)t[i]=s[i]}else{let e=Math.min(s.length,t.length);t.set(new s.constructor(s.buffer,0,e))}}var So=class extends ee{constructor(t,e,i=e*2,n){super(new kt,n),this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=t,this._maxVertexCount=e,this._maxIndexCount=i,this._multiDrawCounts=new Int32Array(t),this._multiDrawStarts=new Int32Array(t),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let t=Math.sqrt(this._maxInstanceCount*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4),i=new ui(e,t,t,si,ni);this._matricesTexture=i}_initIndirectTexture(){let t=Math.sqrt(this._maxInstanceCount);t=Math.ceil(t);let e=new Uint32Array(t*t),i=new ui(e,t,t,wa,Pi);this._indirectTexture=i}_initColorsTexture(){let t=Math.sqrt(this._maxInstanceCount);t=Math.ceil(t);let e=new Float32Array(t*t*4).fill(1),i=new ui(e,t,t,si,ni);i.colorSpace=te.workingColorSpace,this._colorsTexture=i}_initializeGeometry(t){let e=this.geometry,i=this._maxVertexCount,n=this._maxIndexCount;if(this._geometryInitialized===!1){for(let r in t.attributes){let a=t.getAttribute(r),{array:o,itemSize:l,normalized:c}=a,h=new o.constructor(i*l),d=new he(h,l,c);e.setAttribute(r,d)}if(t.getIndex()!==null){let r=i>65535?new Uint32Array(n):new Uint16Array(n);e.setIndex(new he(r,1))}this._geometryInitialized=!0}}_validateGeometry(t){let e=this.geometry;if(!!t.getIndex()!=!!e.getIndex())throw new Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let i in e.attributes){if(!t.hasAttribute(i))throw new Error(`THREE.BatchedMesh: Added geometry missing "${i}". All geometries must have consistent attributes.`);let n=t.getAttribute(i),r=e.getAttribute(i);if(n.itemSize!==r.itemSize||n.normalized!==r.normalized)throw new Error("THREE.BatchedMesh: All attributes must have a consistent itemSize and normalized value.")}}validateInstanceId(t){let e=this._instanceInfo;if(t<0||t>=e.length||e[t].active===!1)throw new Error(`THREE.BatchedMesh: Invalid instanceId ${t}. Instance is either out of range or has been deleted.`)}validateGeometryId(t){let e=this._geometryInfo;if(t<0||t>=e.length||e[t].active===!1)throw new Error(`THREE.BatchedMesh: Invalid geometryId ${t}. Geometry is either out of range or has been deleted.`)}setCustomSort(t){return this.customSort=t,this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new He);let t=this.boundingBox,e=this._instanceInfo;t.makeEmpty();for(let i=0,n=e.length;i<n;i++){if(e[i].active===!1)continue;let r=e[i].geometryIndex;this.getMatrixAt(i,mi),this.getBoundingBoxAt(r,Bc).applyMatrix4(mi),t.union(Bc)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ke);let t=this.boundingSphere,e=this._instanceInfo;t.makeEmpty();for(let i=0,n=e.length;i<n;i++){if(e[i].active===!1)continue;let r=e[i].geometryIndex;this.getMatrixAt(i,mi),this.getBoundingSphereAt(r,Ms).applyMatrix4(mi),t.union(Ms)}}addInstance(t){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw new Error("THREE.BatchedMesh: Maximum item count reached.");let i={visible:!0,active:!0,geometryIndex:t},n=null;this._availableInstanceIds.length>0?(this._availableInstanceIds.sort(yd),n=this._availableInstanceIds.shift(),this._instanceInfo[n]=i):(n=this._instanceInfo.length,this._instanceInfo.push(i));let r=this._matricesTexture;mi.identity().toArray(r.image.data,n*16),r.needsUpdate=!0;let a=this._colorsTexture;return a&&(N_.toArray(a.image.data,n*4),a.needsUpdate=!0),this._visibilityChanged=!0,n}addGeometry(t,e=-1,i=-1){this._initializeGeometry(t),this._validateGeometry(t);let n={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},r=this._geometryInfo;n.vertexStart=this._nextVertexStart,n.reservedVertexCount=e===-1?t.getAttribute("position").count:e;let a=t.getIndex();if(a!==null&&(n.indexStart=this._nextIndexStart,n.reservedIndexCount=i===-1?a.count:i),n.indexStart!==-1&&n.indexStart+n.reservedIndexCount>this._maxIndexCount||n.vertexStart+n.reservedVertexCount>this._maxVertexCount)throw new Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let l;return this._availableGeometryIds.length>0?(this._availableGeometryIds.sort(yd),l=this._availableGeometryIds.shift(),r[l]=n):(l=this._geometryCount,this._geometryCount++,r.push(n)),this.setGeometryAt(l,t),this._nextIndexStart=n.indexStart+n.reservedIndexCount,this._nextVertexStart=n.vertexStart+n.reservedVertexCount,l}setGeometryAt(t,e){if(t>=this._geometryCount)throw new Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(e);let i=this.geometry,n=i.getIndex()!==null,r=i.getIndex(),a=e.getIndex(),o=this._geometryInfo[t];if(n&&a.count>o.reservedIndexCount||e.attributes.position.count>o.reservedVertexCount)throw new Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let l=o.vertexStart,c=o.reservedVertexCount;o.vertexCount=e.getAttribute("position").count;for(let h in i.attributes){let d=e.getAttribute(h),u=i.getAttribute(h);B_(d,u,l);let f=d.itemSize;for(let p=d.count,_=c;p<_;p++){let g=l+p;for(let m=0;m<f;m++)u.setComponent(g,m,0)}u.needsUpdate=!0,u.addUpdateRange(l*f,c*f)}if(n){let h=o.indexStart,d=o.reservedIndexCount;o.indexCount=e.getIndex().count;for(let u=0;u<a.count;u++)r.setX(h+u,l+a.getX(u));for(let u=a.count,f=d;u<f;u++)r.setX(h+u,l);r.needsUpdate=!0,r.addUpdateRange(h,o.reservedIndexCount)}return o.start=n?o.indexStart:o.vertexStart,o.count=n?o.indexCount:o.vertexCount,o.boundingBox=null,e.boundingBox!==null&&(o.boundingBox=e.boundingBox.clone()),o.boundingSphere=null,e.boundingSphere!==null&&(o.boundingSphere=e.boundingSphere.clone()),this._visibilityChanged=!0,t}deleteGeometry(t){let e=this._geometryInfo;if(t>=e.length||e[t].active===!1)return this;let i=this._instanceInfo;for(let n=0,r=i.length;n<r;n++)i[n].active&&i[n].geometryIndex===t&&this.deleteInstance(n);return e[t].active=!1,this._availableGeometryIds.push(t),this._visibilityChanged=!0,this}deleteInstance(t){return this.validateInstanceId(t),this._instanceInfo[t].active=!1,this._availableInstanceIds.push(t),this._visibilityChanged=!0,this}optimize(){let t=0,e=0,i=this._geometryInfo,n=i.map((a,o)=>o).sort((a,o)=>i[a].vertexStart-i[o].vertexStart),r=this.geometry;for(let a=0,o=i.length;a<o;a++){let l=n[a],c=i[l];if(c.active!==!1){if(r.index!==null){if(c.indexStart!==e){let{indexStart:h,vertexStart:d,reservedIndexCount:u}=c,f=r.index,p=f.array,_=t-d;for(let g=h;g<h+u;g++)p[g]=p[g]+_;f.array.copyWithin(e,h,h+u),f.addUpdateRange(e,u),f.needsUpdate=!0,c.indexStart=e}e+=c.reservedIndexCount}if(c.vertexStart!==t){let{vertexStart:h,reservedVertexCount:d}=c,u=r.attributes;for(let f in u){let p=u[f],{array:_,itemSize:g}=p;_.copyWithin(t*g,h*g,(h+d)*g),p.addUpdateRange(t*g,d*g),p.needsUpdate=!0}c.vertexStart=t}t+=c.reservedVertexCount,c.start=r.index?c.indexStart:c.vertexStart}}return this._nextIndexStart=e,this._nextVertexStart=t,this._visibilityChanged=!0,this}getBoundingBoxAt(t,e){if(t>=this._geometryCount)return null;let i=this.geometry,n=this._geometryInfo[t];if(n.boundingBox===null){let r=new He,a=i.index,o=i.attributes.position;for(let l=n.start,c=n.start+n.count;l<c;l++){let h=l;a&&(h=a.getX(h)),r.expandByPoint(Ka.fromBufferAttribute(o,h))}n.boundingBox=r}return e.copy(n.boundingBox),e}getBoundingSphereAt(t,e){if(t>=this._geometryCount)return null;let i=this.geometry,n=this._geometryInfo[t];if(n.boundingSphere===null){let r=new ke;this.getBoundingBoxAt(t,Bc),Bc.getCenter(r.center);let a=i.index,o=i.attributes.position,l=0;for(let c=n.start,h=n.start+n.count;c<h;c++){let d=c;a&&(d=a.getX(d)),Ka.fromBufferAttribute(o,d),l=Math.max(l,r.center.distanceToSquared(Ka))}r.radius=Math.sqrt(l),n.boundingSphere=r}return e.copy(n.boundingSphere),e}setMatrixAt(t,e){this.validateInstanceId(t);let i=this._matricesTexture,n=this._matricesTexture.image.data;return e.toArray(n,t*16),i.needsUpdate=!0,this}getMatrixAt(t,e){return this.validateInstanceId(t),e.fromArray(this._matricesTexture.image.data,t*16)}setColorAt(t,e){return this.validateInstanceId(t),this._colorsTexture===null&&this._initColorsTexture(),e.toArray(this._colorsTexture.image.data,t*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(t,e){return this.validateInstanceId(t),this._colorsTexture===null?e.isVector4?e.set(1,1,1,1):e.setRGB(1,1,1):e.fromArray(this._colorsTexture.image.data,t*4)}setVisibleAt(t,e){return this.validateInstanceId(t),this._instanceInfo[t].visible===e?this:(this._instanceInfo[t].visible=e,this._visibilityChanged=!0,this)}getVisibleAt(t){return this.validateInstanceId(t),this._instanceInfo[t].visible}setGeometryIdAt(t,e){return this.validateInstanceId(t),this.validateGeometryId(e),this._instanceInfo[t].geometryIndex=e,this._visibilityChanged=!0,this}getGeometryIdAt(t){return this.validateInstanceId(t),this._instanceInfo[t].geometryIndex}getGeometryRangeAt(t,e={}){this.validateGeometryId(t);let i=this._geometryInfo[t];return e.vertexStart=i.vertexStart,e.vertexCount=i.vertexCount,e.reservedVertexCount=i.reservedVertexCount,e.indexStart=i.indexStart,e.indexCount=i.indexCount,e.reservedIndexCount=i.reservedIndexCount,e.start=i.start,e.count=i.count,e}setInstanceCount(t){let e=this._availableInstanceIds,i=this._instanceInfo;for(e.sort(yd);e[e.length-1]===i.length-1;)i.pop(),e.pop();if(t<i.length)throw new Error(`THREE.BatchedMesh: Instance ids outside the range ${t} are being used. Cannot shrink instance count.`);let n=new Int32Array(t),r=new Int32Array(t);bs(this._multiDrawCounts,n),bs(this._multiDrawStarts,r),this._multiDrawCounts=n,this._multiDrawStarts=r,this._maxInstanceCount=t;let a=this._indirectTexture,o=this._matricesTexture,l=this._colorsTexture;a.dispose(),this._initIndirectTexture(),bs(a.image.data,this._indirectTexture.image.data),o.dispose(),this._initMatricesTexture(),bs(o.image.data,this._matricesTexture.image.data),l&&(l.dispose(),this._initColorsTexture(),bs(l.image.data,this._colorsTexture.image.data))}setGeometrySize(t,e){let i=[...this._geometryInfo].filter(o=>o.active);if(Math.max(...i.map(o=>o.vertexStart+o.reservedVertexCount))>t)throw new Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${e}. Cannot shrink further.`);if(this.geometry.index&&Math.max(...i.map(l=>l.indexStart+l.reservedIndexCount))>e)throw new Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${e}. Cannot shrink further.`);let r=this.geometry;r.dispose(),this._maxVertexCount=t,this._maxIndexCount=e,this._geometryInitialized&&(this._geometryInitialized=!1,this.geometry=new kt,this._initializeGeometry(r));let a=this.geometry;r.index&&bs(r.index.array,a.index.array);for(let o in r.attributes)bs(r.attributes[o].array,a.attributes[o].array)}raycast(t,e){let i=this._instanceInfo,n=this._geometryInfo,r=this.matrixWorld,a=this.geometry;ii.material=this.material,ii.geometry.index=a.index,ii.geometry.attributes=a.attributes,ii.geometry.boundingBox===null&&(ii.geometry.boundingBox=new He),ii.geometry.boundingSphere===null&&(ii.geometry.boundingSphere=new ke);for(let o=0,l=i.length;o<l;o++){if(!i[o].visible||!i[o].active)continue;let c=i[o].geometryIndex,h=n[c];ii.geometry.setDrawRange(h.start,h.count),this.getMatrixAt(o,ii.matrixWorld).premultiply(r),this.getBoundingBoxAt(c,ii.geometry.boundingBox),this.getBoundingSphereAt(c,ii.geometry.boundingSphere),ii.raycast(t,zc);for(let d=0,u=zc.length;d<u;d++){let f=zc[d];f.object=this,f.batchId=o,e.push(f)}zc.length=0}ii.material=null,ii.geometry.index=null,ii.geometry.attributes={},ii.geometry.setDrawRange(0,1/0)}copy(t){return super.copy(t),this.geometry=t.geometry.clone(),this.perObjectFrustumCulled=t.perObjectFrustumCulled,this.sortObjects=t.sortObjects,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this._geometryInfo=t._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox!==null?e.boundingBox.clone():null,boundingSphere:e.boundingSphere!==null?e.boundingSphere.clone():null})),this._instanceInfo=t._instanceInfo.map(e=>({...e})),this._availableInstanceIds=t._availableInstanceIds.slice(),this._availableGeometryIds=t._availableGeometryIds.slice(),this._nextIndexStart=t._nextIndexStart,this._nextVertexStart=t._nextVertexStart,this._geometryCount=t._geometryCount,this._maxInstanceCount=t._maxInstanceCount,this._maxVertexCount=t._maxVertexCount,this._maxIndexCount=t._maxIndexCount,this._geometryInitialized=t._geometryInitialized,this._multiDrawCounts=t._multiDrawCounts.slice(),this._multiDrawStarts=t._multiDrawStarts.slice(),this._multiDrawBytesPerElement=t._multiDrawBytesPerElement,this._indirectTexture=t._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=t._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),this._colorsTexture!==null&&(this._colorsTexture=t._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice()),this}dispose(){super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null&&(this._colorsTexture.dispose(),this._colorsTexture=null)}onBeforeRender(t,e,i,n,r){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let a=n.getIndex(),o=a===null?1:a.array.BYTES_PER_ELEMENT,l=1;r.wireframe&&(l=2,o=n.attributes.position.count>65535?4:2);let c=this._instanceInfo,h=this._multiDrawStarts,d=this._multiDrawCounts,u=this._geometryInfo,f=this.perObjectFrustumCulled,p=this._indirectTexture,_=p.image.data,g=i.isArrayCamera?F_:U_;f&&(i.isArrayCamera?g.setFromArrayCamera(i):(mi.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse).multiply(this.matrixWorld),g.setFromProjectionMatrix(mi,i.coordinateSystem,i.reversedDepth)));let m=0;if(this.sortObjects){mi.copy(this.matrixWorld).invert(),Ka.setFromMatrixPosition(i.matrixWorld).applyMatrix4(mi),Zp.set(0,0,-1).transformDirection(i.matrixWorld).transformDirection(mi);for(let x=0,M=c.length;x<M;x++)if(c[x].visible&&c[x].active){let S=c[x].geometryIndex;this.getMatrixAt(x,mi),this.getBoundingSphereAt(S,Ms).applyMatrix4(mi);let A=!1;if(f&&(A=!g.intersectsSphere(Ms)),!A){let v=u[S],E=O_.subVectors(Ms.center,Ka).dot(Zp);Md.push(v.start,v.count,E,x)}}let y=Md.list,w=this.customSort;w===null?y.sort(r.transparent?D_:L_):w.call(this,y,i);for(let x=0,M=y.length;x<M;x++){let S=y[x];h[m]=S.start*o*l,d[m]=S.count*l,_[m]=S.index,m++}Md.reset()}else for(let y=0,w=c.length;y<w;y++)if(c[y].visible&&c[y].active){let x=c[y].geometryIndex,M=!1;if(f&&(this.getMatrixAt(y,mi),this.getBoundingSphereAt(x,Ms).applyMatrix4(mi),M=!g.intersectsSphere(Ms)),!M){let S=u[x];h[m]=S.start*o*l,d[m]=S.count*l,_[m]=y,m++}}p.needsUpdate=!0,this._multiDrawCount=m,this._multiDrawBytesPerElement=o,this._visibilityChanged=!1}onBeforeShadow(t,e,i,n,r,a){this.onBeforeRender(t,null,n,r,a)}},Ze=class extends Ve{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new at(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},gh=new C,_h=new C,$p=new Ht,ja=new Qi,kc=new ke,bd=new C,Jp=new C,tn=class extends re{constructor(t=new kt,e=new Ze){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let n=1,r=e.count;n<r;n++)gh.fromBufferAttribute(e,n-1),_h.fromBufferAttribute(e,n),i[n]=i[n-1],i[n]+=gh.distanceTo(_h);t.setAttribute("lineDistance",new vt(i,1))}else pt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),kc.copy(i.boundingSphere),kc.applyMatrix4(n),kc.radius+=r,t.ray.intersectsSphere(kc)===!1)return;$p.copy(n).invert(),ja.copy(t.ray).applyMatrix4($p);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){let f=Math.max(0,a.start),p=Math.min(h.count,a.start+a.count);for(let _=f,g=p-1;_<g;_+=c){let m=h.getX(_),y=h.getX(_+1),w=Vc(this,t,ja,l,m,y,_);w&&e.push(w)}if(this.isLineLoop){let _=h.getX(p-1),g=h.getX(f),m=Vc(this,t,ja,l,_,g,p-1);m&&e.push(m)}}else{let f=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let _=f,g=p-1;_<g;_+=c){let m=Vc(this,t,ja,l,_,_+1,_);m&&e.push(m)}if(this.isLineLoop){let _=Vc(this,t,ja,l,p-1,f,p-1);_&&e.push(_)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Vc(s,t,e,i,n,r,a){let o=s.geometry.attributes.position;if(gh.fromBufferAttribute(o,n),_h.fromBufferAttribute(o,r),e.distanceSqToSegment(gh,_h,bd,Jp)>i)return;bd.applyMatrix4(s.matrixWorld);let c=t.ray.origin.distanceTo(bd);if(!(c<t.near||c>t.far))return{distance:c,point:Jp.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}var Kp=new C,jp=new C,Ai=class extends tn{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let n=0,r=e.count;n<r;n+=2)Kp.fromBufferAttribute(e,n),jp.fromBufferAttribute(e,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+Kp.distanceTo(jp);t.setAttribute("lineDistance",new vt(i,1))}else pt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},wo=class extends tn{constructor(t,e){super(t,e),this.isLineLoop=!0,this.type="LineLoop"}},is=class extends Ve{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new at(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Qp=new Ht,Ud=new Qi,Gc=new ke,Hc=new C,zs=class extends re{constructor(t=new kt,e=new is){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Gc.copy(i.boundingSphere),Gc.applyMatrix4(n),Gc.radius+=r,t.ray.intersectsSphere(Gc)===!1)return;Qp.copy(n).invert(),Ud.copy(t.ray).applyMatrix4(Qp);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,d=i.attributes.position;if(c!==null){let u=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let p=u,_=f;p<_;p++){let g=c.getX(p);Hc.fromBufferAttribute(d,g),tm(Hc,g,l,n,t,e,this)}}else{let u=Math.max(0,a.start),f=Math.min(d.count,a.start+a.count);for(let p=u,_=f;p<_;p++)Hc.fromBufferAttribute(d,p),tm(Hc,p,l,n,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function tm(s,t,e,i,n,r,a){let o=Ud.distanceSqToPoint(s);if(o<e){let l=new C;Ud.closestPointToPoint(s,l),l.applyMatrix4(i);let c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var To=class extends Le{constructor(t,e,i,n,r=Se,a=Se,o,l,c){super(t,e,i,n,r,a,o,l,c),this.isVideoTexture=!0,this.generateMipmaps=!1,this._requestVideoFrameCallbackId=0;let h=this;function d(){h.needsUpdate=!0,h._requestVideoFrameCallbackId=t.requestVideoFrameCallback(d)}"requestVideoFrameCallback"in t&&(this._requestVideoFrameCallbackId=t.requestVideoFrameCallback(d))}clone(){return new this.constructor(this.image).copy(this)}update(){let t=this.image;"requestVideoFrameCallback"in t===!1&&t.readyState>=t.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}dispose(){this._requestVideoFrameCallbackId!==0&&(this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId),this._requestVideoFrameCallbackId=0),super.dispose()}},xh=class extends To{constructor(t,e,i,n,r,a,o,l){super({},t,e,i,n,r,a,o,l),this.isVideoFrameTexture=!0}update(){}clone(){return new this.constructor().copy(this)}setFrame(t){this.image=t,this.needsUpdate=!0}},vh=class extends Le{constructor(t,e){super({width:t,height:e}),this.isFramebufferTexture=!0,this.magFilter=Ie,this.minFilter=Ie,this.generateMipmaps=!1,this.needsUpdate=!0}},ks=class extends Le{constructor(t,e,i,n,r,a,o,l,c,h,d,u){super(null,a,o,l,c,h,n,r,d,u),this.isCompressedTexture=!0,this.image={width:e,height:i},this.mipmaps=t,this.flipY=!1,this.generateMipmaps=!1}},yh=class extends ks{constructor(t,e,i,n,r,a){super(t,e,i,r,a),this.isCompressedArrayTexture=!0,this.image.depth=n,this.wrapR=hi,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}},Mh=class extends ks{constructor(t,e,i){super(void 0,t[0].width,t[0].height,e,i,sn),this.isCompressedCubeTexture=!0,this.isCubeTexture=!0,this.image=t}},ns=class extends Le{constructor(t=[],e=sn,i,n,r,a,o,l,c,h){super(t,e,i,n,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},fn=class extends Le{constructor(t,e,i,n,r,a,o,l,c){super(t,e,i,n,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},bh=class extends Le{constructor(t,e,i,n,r,a,o,l,c){super(t,e,i,n,r,a,o,l,c),this.isHTMLTexture=!0,this.generateMipmaps=!1,this.needsUpdate=!0;let h=t?t.parentNode:null;h!==null&&"requestPaint"in h&&(h.onpaint=()=>{this.needsUpdate=!0},h.requestPaint())}dispose(){let t=this.image?this.image.parentNode:null;t!==null&&"onpaint"in t&&(t.onpaint=null),super.dispose()}},Ln=class extends Le{constructor(t,e,i=Pi,n,r,a,o=Ie,l=Ie,c,h=ji,d=1){if(h!==ji&&h!==Bn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,n,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Ui(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Eo=class extends Ln{constructor(t,e=Pi,i=sn,n,r,a=Ie,o=Ie,l,c=ji){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,i,n,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Yr=class extends Le{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Ke=class s extends kt{constructor(t=1,e=1,i=1,n=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:r,depthSegments:a};let o=this;n=Math.floor(n),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,f=0;p("z","y","x",-1,-1,i,e,t,a,r,0),p("z","y","x",1,-1,i,e,-t,a,r,1),p("x","z","y",1,1,t,i,e,n,a,2),p("x","z","y",1,-1,t,i,-e,n,a,3),p("x","y","z",1,-1,t,e,i,n,r,4),p("x","y","z",-1,-1,t,e,-i,n,r,5),this.setIndex(l),this.setAttribute("position",new vt(c,3)),this.setAttribute("normal",new vt(h,3)),this.setAttribute("uv",new vt(d,2));function p(_,g,m,y,w,x,M,S,A,v,E){let P=x/A,I=M/v,F=x/2,B=M/2,D=S/2,z=A+1,X=v+1,W=0,rt=0,Y=new C;for(let tt=0;tt<X;tt++){let nt=tt*I-B;for(let Ut=0;Ut<z;Ut++){let Rt=Ut*P-F;Y[_]=Rt*y,Y[g]=nt*w,Y[m]=D,c.push(Y.x,Y.y,Y.z),Y[_]=0,Y[g]=0,Y[m]=S>0?1:-1,h.push(Y.x,Y.y,Y.z),d.push(Ut/A),d.push(1-tt/v),W+=1}}for(let tt=0;tt<v;tt++)for(let nt=0;nt<A;nt++){let Ut=u+nt+z*tt,Rt=u+nt+z*(tt+1),ue=u+(nt+1)+z*(tt+1),ie=u+(nt+1)+z*tt;l.push(Ut,Rt,ie),l.push(Rt,ue,ie),rt+=6}o.addGroup(f,rt,E),f+=rt,u+=W}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ao=class s extends kt{constructor(t=1,e=1,i=4,n=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:i,radialSegments:n,heightSegments:r},e=Math.max(0,e),i=Math.max(1,Math.floor(i)),n=Math.max(3,Math.floor(n)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],h=e/2,d=Math.PI/2*t,u=e,f=2*d+u,p=i*2+r,_=n+1,g=new C,m=new C;for(let y=0;y<=p;y++){let w=0,x=0,M=0,S=0;if(y<=i){let E=y/i,P=E*Math.PI/2;x=-h-t*Math.cos(P),M=t*Math.sin(P),S=-t*Math.cos(P),w=E*d}else if(y<=i+r){let E=(y-i)/r;x=-h+E*e,M=t,S=0,w=d+E*u}else{let E=(y-i-r)/i,P=E*Math.PI/2;x=h+t*Math.sin(P),M=t*Math.cos(P),S=t*Math.sin(P),w=d+u+E*d}let A=Math.max(0,Math.min(1,w/f)),v=0;y===0?v=.5/n:y===p&&(v=-.5/n);for(let E=0;E<=n;E++){let P=E/n,I=P*Math.PI*2,F=Math.sin(I),B=Math.cos(I);m.x=-M*B,m.y=x,m.z=M*F,o.push(m.x,m.y,m.z),g.set(-M*B,S,M*F),g.normalize(),l.push(g.x,g.y,g.z),c.push(P+v,A)}if(y>0){let E=(y-1)*_;for(let P=0;P<n;P++){let I=E+P,F=E+P+1,B=y*_+P,D=y*_+P+1;a.push(I,F,B),a.push(F,D,B)}}}this.setIndex(a),this.setAttribute("position",new vt(o,3)),this.setAttribute("normal",new vt(l,3)),this.setAttribute("uv",new vt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Co=class s extends kt{constructor(t=1,e=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:n},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new C,h=new q;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=e;d++,u+=3){let f=i+d/e*n;c.x=t*Math.cos(f),c.y=t*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[u]/t+1)/2,h.y=(a[u+1]/t+1)/2,l.push(h.x,h.y)}for(let d=1;d<=e;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new vt(a,3)),this.setAttribute("normal",new vt(o,3)),this.setAttribute("uv",new vt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Bi=class s extends kt{constructor(t=1,e=1,i=1,n=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;n=Math.floor(n),r=Math.floor(r);let h=[],d=[],u=[],f=[],p=0,_=[],g=i/2,m=0;y(),a===!1&&(t>0&&w(!0),e>0&&w(!1)),this.setIndex(h),this.setAttribute("position",new vt(d,3)),this.setAttribute("normal",new vt(u,3)),this.setAttribute("uv",new vt(f,2));function y(){let x=new C,M=new C,S=0,A=(e-t)/i;for(let v=0;v<=r;v++){let E=[],P=v/r,I=P*(e-t)+t;for(let F=0;F<=n;F++){let B=F/n,D=B*l+o,z=Math.sin(D),X=Math.cos(D);M.x=I*z,M.y=-P*i+g,M.z=I*X,d.push(M.x,M.y,M.z),x.set(z,A,X).normalize(),u.push(x.x,x.y,x.z),f.push(B,1-P),E.push(p++)}_.push(E)}for(let v=0;v<n;v++)for(let E=0;E<r;E++){let P=_[E][v],I=_[E+1][v],F=_[E+1][v+1],B=_[E][v+1];(t>0||E!==0)&&(h.push(P,I,B),S+=3),(e>0||E!==r-1)&&(h.push(I,F,B),S+=3)}c.addGroup(m,S,0),m+=S}function w(x){let M=p,S=new q,A=new C,v=0,E=x===!0?t:e,P=x===!0?1:-1;for(let F=1;F<=n;F++)d.push(0,g*P,0),u.push(0,P,0),f.push(.5,.5),p++;let I=p;for(let F=0;F<=n;F++){let D=F/n*l+o,z=Math.cos(D),X=Math.sin(D);A.x=E*X,A.y=g*P,A.z=E*z,d.push(A.x,A.y,A.z),u.push(0,P,0),S.x=z*.5+.5,S.y=X*.5*P+.5,f.push(S.x,S.y),p++}for(let F=0;F<n;F++){let B=M+F,D=I+F;x===!0?h.push(D,D+1,B):h.push(D+1,D,B),v+=3}c.addGroup(m,v,x===!0?1:2),m+=v}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Zr=class s extends Bi{constructor(t=1,e=1,i=32,n=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,i,n,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Dn=class s extends kt{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};let r=[],a=[];o(n),c(i),h(),this.setAttribute("position",new vt(r,3)),this.setAttribute("normal",new vt(r.slice(),3)),this.setAttribute("uv",new vt(a,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function o(y){let w=new C,x=new C,M=new C;for(let S=0;S<e.length;S+=3)f(e[S+0],w),f(e[S+1],x),f(e[S+2],M),l(w,x,M,y)}function l(y,w,x,M){let S=M+1,A=[];for(let v=0;v<=S;v++){A[v]=[];let E=y.clone().lerp(x,v/S),P=w.clone().lerp(x,v/S),I=S-v;for(let F=0;F<=I;F++)F===0&&v===S?A[v][F]=E:A[v][F]=E.clone().lerp(P,F/I)}for(let v=0;v<S;v++)for(let E=0;E<2*(S-v)-1;E++){let P=Math.floor(E/2);E%2===0?(u(A[v][P+1]),u(A[v+1][P]),u(A[v][P])):(u(A[v][P+1]),u(A[v+1][P+1]),u(A[v+1][P]))}}function c(y){let w=new C;for(let x=0;x<r.length;x+=3)w.x=r[x+0],w.y=r[x+1],w.z=r[x+2],w.normalize().multiplyScalar(y),r[x+0]=w.x,r[x+1]=w.y,r[x+2]=w.z}function h(){let y=new C;for(let w=0;w<r.length;w+=3){y.x=r[w+0],y.y=r[w+1],y.z=r[w+2];let x=g(y)/2/Math.PI+.5,M=m(y)/Math.PI+.5;a.push(x,1-M)}p(),d()}function d(){for(let y=0;y<a.length;y+=6){let w=a[y+0],x=a[y+2],M=a[y+4],S=Math.max(w,x,M),A=Math.min(w,x,M);S>.9&&A<.1&&(w<.2&&(a[y+0]+=1),x<.2&&(a[y+2]+=1),M<.2&&(a[y+4]+=1))}}function u(y){r.push(y.x,y.y,y.z)}function f(y,w){let x=y*3;w.x=t[x+0],w.y=t[x+1],w.z=t[x+2]}function p(){let y=new C,w=new C,x=new C,M=new C,S=new q,A=new q,v=new q;for(let E=0,P=0;E<r.length;E+=9,P+=6){y.set(r[E+0],r[E+1],r[E+2]),w.set(r[E+3],r[E+4],r[E+5]),x.set(r[E+6],r[E+7],r[E+8]),S.set(a[P+0],a[P+1]),A.set(a[P+2],a[P+3]),v.set(a[P+4],a[P+5]),M.copy(y).add(w).add(x).divideScalar(3);let I=g(M);_(S,P+0,y,I),_(A,P+2,w,I),_(v,P+4,x,I)}}function _(y,w,x,M){M<0&&y.x===1&&(a[w]=y.x-1),x.x===0&&x.z===0&&(a[w]=M/2/Math.PI+.5)}function g(y){return Math.atan2(y.z,-y.x)}function m(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.vertices,t.indices,t.radius,t.detail)}},Ro=class s extends Dn{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=1/i,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-n,-i,0,-n,i,0,n,-i,0,n,i,-n,-i,0,-n,i,0,n,-i,0,n,i,0,-i,0,-n,i,0,-n,-i,0,n,i,0,n],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}},Wc=new C,Xc=new C,Sd=new C,qc=new Ji,Po=class extends kt{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){let n=Math.pow(10,4),r=Math.cos(Rs*e),a=t.getIndex(),o=t.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},f=[];for(let p=0;p<l;p+=3){a?(c[0]=a.getX(p),c[1]=a.getX(p+1),c[2]=a.getX(p+2)):(c[0]=p,c[1]=p+1,c[2]=p+2);let{a:_,b:g,c:m}=qc;if(_.fromBufferAttribute(o,c[0]),g.fromBufferAttribute(o,c[1]),m.fromBufferAttribute(o,c[2]),qc.getNormal(Sd),d[0]=`${Math.round(_.x*n)},${Math.round(_.y*n)},${Math.round(_.z*n)}`,d[1]=`${Math.round(g.x*n)},${Math.round(g.y*n)},${Math.round(g.z*n)}`,d[2]=`${Math.round(m.x*n)},${Math.round(m.y*n)},${Math.round(m.z*n)}`,!(d[0]===d[1]||d[1]===d[2]||d[2]===d[0]))for(let y=0;y<3;y++){let w=(y+1)%3,x=d[y],M=d[w],S=qc[h[y]],A=qc[h[w]],v=`${x}_${M}`,E=`${M}_${x}`;E in u&&u[E]?(Sd.dot(u[E].normal)<=r&&(f.push(S.x,S.y,S.z),f.push(A.x,A.y,A.z)),u[E]=null):v in u||(u[v]={index0:c[y],index1:c[w],normal:Sd.clone()})}}for(let p in u)if(u[p]){let{index0:_,index1:g}=u[p];Wc.fromBufferAttribute(o,_),Xc.fromBufferAttribute(o,g),f.push(Wc.x,Wc.y,Wc.z),f.push(Xc.x,Xc.y,Xc.z)}this.setAttribute("position",new vt(f,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}},yi=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){pt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,n=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)i=this.getPoint(a/t),r+=i.distanceTo(n),e.push(r),n=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let i=this.getLengths(),n=0,r=i.length,a;e?a=e:a=t*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(n=Math.floor(o+(l-o)/2),c=i[n]-a,c<0)o=n+1;else if(c>0)l=n-1;else{l=n;break}if(n=l,i[n]===a)return n/(r-1);let h=i[n],u=i[n+1]-h,f=(a-h)/u;return(n+f)/(r-1)}getTangent(t,e){let n=t-1e-4,r=t+1e-4;n<0&&(n=0),r>1&&(r=1);let a=this.getPoint(n),o=this.getPoint(r),l=e||(a.isVector2?new q:new C);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){let i=new C,n=[],r=[],a=[],o=new C,l=new Ht;for(let f=0;f<=t;f++){let p=f/t;n[f]=this.getTangentAt(p,new C)}r[0]=new C,a[0]=new C;let c=Number.MAX_VALUE,h=Math.abs(n[0].x),d=Math.abs(n[0].y),u=Math.abs(n[0].z);h<=c&&(c=h,i.set(1,0,0)),d<=c&&(c=d,i.set(0,1,0)),u<=c&&i.set(0,0,1),o.crossVectors(n[0],i).normalize(),r[0].crossVectors(n[0],o),a[0].crossVectors(n[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(n[f-1],n[f]),o.length()>Number.EPSILON){o.normalize();let p=Math.acos(Xt(n[f-1].dot(n[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,p))}a[f].crossVectors(n[f],r[f])}if(e===!0){let f=Math.acos(Xt(r[0].dot(r[t]),-1,1));f/=t,n[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let p=1;p<=t;p++)r[p].applyMatrix4(l.makeRotationAxis(n[p],f*p)),a[p].crossVectors(n[p],r[p])}return{tangents:n,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Vs=class extends yi{constructor(t=0,e=0,i=1,n=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=n,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new q){let i=e,n=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=n;for(;r>n;)r-=n;r<Number.EPSILON&&(a?r=0:r=n),this.aClockwise===!0&&!a&&(r===n?r=-n:r=r-n);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*h-f*d+this.aX,c=u*d+f*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Io=class extends Vs{constructor(t,e,i,n,r,a){super(t,e,i,i,n,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Lf(){let s=0,t=0,e=0,i=0;function n(r,a,o,l){s=r,t=o,e=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){n(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,d){let u=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,f*=h,n(a,o,u,f)},calc:function(r){let a=r*r,o=a*r;return s+t*r+e*a+i*o}}}var em=new C,im=new C,wd=new Lf,Td=new Lf,Ed=new Lf,Lo=class extends yi{constructor(t=[],e=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=n}getPoint(t,e=new C){let i=e,n=this.points,r=n.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=n[(o-1)%r]:(im.subVectors(n[0],n[1]).add(n[0]),c=im);let d=n[o%r],u=n[(o+1)%r];if(this.closed||o+2<r?h=n[(o+2)%r]:(em.subVectors(n[r-1],n[r-2]).add(n[r-1]),h=em),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,p=Math.pow(c.distanceToSquared(d),f),_=Math.pow(d.distanceToSquared(u),f),g=Math.pow(u.distanceToSquared(h),f);_<1e-4&&(_=1),p<1e-4&&(p=_),g<1e-4&&(g=_),wd.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,p,_,g),Td.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,p,_,g),Ed.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,p,_,g)}else this.curveType==="catmullrom"&&(wd.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),Td.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),Ed.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return i.set(wd.calc(l),Td.calc(l),Ed.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new C().fromArray(n))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function nm(s,t,e,i,n){let r=(i-t)*.5,a=(n-e)*.5,o=s*s,l=s*o;return(2*e-2*i+r+a)*l+(-3*e+3*i-2*r-a)*o+r*s+e}function z_(s,t){let e=1-s;return e*e*t}function k_(s,t){return 2*(1-s)*s*t}function V_(s,t){return s*s*t}function so(s,t,e,i){return z_(s,t)+k_(s,e)+V_(s,i)}function G_(s,t){let e=1-s;return e*e*e*t}function H_(s,t){let e=1-s;return 3*e*e*s*t}function W_(s,t){return 3*(1-s)*s*s*t}function X_(s,t){return s*s*s*t}function ro(s,t,e,i,n){return G_(s,t)+H_(s,e)+W_(s,i)+X_(s,n)}var $r=class extends yi{constructor(t=new q,e=new q,i=new q,n=new q){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new q){let i=e,n=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(ro(t,n.x,r.x,a.x,o.x),ro(t,n.y,r.y,a.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Do=class extends yi{constructor(t=new C,e=new C,i=new C,n=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new C){let i=e,n=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(ro(t,n.x,r.x,a.x,o.x),ro(t,n.y,r.y,a.y,o.y),ro(t,n.z,r.z,a.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Jr=class extends yi{constructor(t=new q,e=new q){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new q){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new q){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},No=class extends yi{constructor(t=new C,e=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new C){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new C){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Kr=class extends yi{constructor(t=new q,e=new q,i=new q){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new q){let i=e,n=this.v0,r=this.v1,a=this.v2;return i.set(so(t,n.x,r.x,a.x),so(t,n.y,r.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},jr=class extends yi{constructor(t=new C,e=new C,i=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new C){let i=e,n=this.v0,r=this.v1,a=this.v2;return i.set(so(t,n.x,r.x,a.x),so(t,n.y,r.y,a.y),so(t,n.z,r.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Qr=class extends yi{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new q){let i=e,n=this.points,r=(n.length-1)*t,a=Math.floor(r),o=r-a,l=n[a===0?a:a-1],c=n[a],h=n[a>n.length-2?n.length-1:a+1],d=n[a>n.length-3?n.length-1:a+2];return i.set(nm(o,l.x,c.x,h.x,d.x),nm(o,l.y,c.y,h.y,d.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new q().fromArray(n))}return this}},Sh=Object.freeze({__proto__:null,ArcCurve:Io,CatmullRomCurve3:Lo,CubicBezierCurve:$r,CubicBezierCurve3:Do,EllipseCurve:Vs,LineCurve:Jr,LineCurve3:No,QuadraticBezierCurve:Kr,QuadraticBezierCurve3:jr,SplineCurve:Qr}),Uo=class extends yi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Sh[i](e,t))}return this}getPoint(t,e){let i=t*this.getLength(),n=this.getCurveLengths(),r=0;for(;r<n.length;){if(n[r]>=i){let a=n[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let i=0,n=this.curves.length;i<n;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],i;for(let n=0,r=this.curves;n<r.length;n++){let a=r[n],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(n.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){let n=this.curves[e];t.curves.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(new Sh[n.type]().fromJSON(n))}return this}},pn=class extends Uo{constructor(t){super(),this.type="Path",this.currentPoint=new q,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let i=new Jr(this.currentPoint.clone(),new q(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,n){let r=new Kr(this.currentPoint.clone(),new q(t,e),new q(i,n));return this.curves.push(r),this.currentPoint.set(i,n),this}bezierCurveTo(t,e,i,n,r,a){let o=new $r(this.currentPoint.clone(),new q(t,e),new q(i,n),new q(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),i=new Qr(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,n,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,i,n,r,a),this}absarc(t,e,i,n,r,a){return this.absellipse(t,e,i,i,n,r,a),this}ellipse(t,e,i,n,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,i,n,r,a,o,l),this}absellipse(t,e,i,n,r,a,o,l){let c=new Vs(t,e,i,n,r,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},zi=class extends pn{constructor(t){super(t),this.uuid=Ei(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let i=0,n=this.holes.length;i<n;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){let n=this.holes[e];t.holes.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(new pn().fromJSON(n))}return this}};function q_(s,t,e=2){let i=t&&t.length,n=i?t[0]*e:s.length,r=Pg(s,0,n,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i&&(r=K_(s,t,r,e)),s.length>80*e){o=s[0],l=s[1];let h=o,d=l;for(let u=e;u<n;u+=e){let f=s[u],p=s[u+1];f<o&&(o=f),p<l&&(l=p),f>h&&(h=f),p>d&&(d=p)}c=Math.max(h-o,d-l),c=c!==0?32767/c:0}return Fo(r,a,e,o,l,c,0),a}function Pg(s,t,e,i,n){let r;if(n===lx(s,t,e,i)>0)for(let a=t;a<e;a+=i)r=sm(a/i|0,s[a],s[a+1],r);else for(let a=e-i;a>=t;a-=i)r=sm(a/i|0,s[a],s[a+1],r);return r&&ta(r,r.next)&&(Bo(r),r=r.next),r}function Gs(s,t){if(!s)return s;t||(t=s);let e=s,i;do if(i=!1,!e.steiner&&(ta(e,e.next)||Ee(e.prev,e,e.next)===0)){if(Bo(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function Fo(s,t,e,i,n,r,a){if(!s)return;!a&&r&&ix(s,i,n,r);let o=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?Z_(s,i,n,r):Y_(s)){t.push(l.i,s.i,c.i),Bo(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=$_(Gs(s),t),Fo(s,t,e,i,n,r,2)):a===2&&J_(s,t,e,i,n,r):Fo(Gs(s),t,e,i,n,r,1);break}}}function Y_(s){let t=s.prev,e=s,i=s.next;if(Ee(t,e,i)>=0)return!1;let n=t.x,r=e.x,a=i.x,o=t.y,l=e.y,c=i.y,h=Math.min(n,r,a),d=Math.min(o,l,c),u=Math.max(n,r,a),f=Math.max(o,l,c),p=i.next;for(;p!==t;){if(p.x>=h&&p.x<=u&&p.y>=d&&p.y<=f&&to(n,o,r,l,a,c,p.x,p.y)&&Ee(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function Z_(s,t,e,i){let n=s.prev,r=s,a=s.next;if(Ee(n,r,a)>=0)return!1;let o=n.x,l=r.x,c=a.x,h=n.y,d=r.y,u=a.y,f=Math.min(o,l,c),p=Math.min(h,d,u),_=Math.max(o,l,c),g=Math.max(h,d,u),m=Fd(f,p,t,e,i),y=Fd(_,g,t,e,i),w=s.prevZ,x=s.nextZ;for(;w&&w.z>=m&&x&&x.z<=y;){if(w.x>=f&&w.x<=_&&w.y>=p&&w.y<=g&&w!==n&&w!==a&&to(o,h,l,d,c,u,w.x,w.y)&&Ee(w.prev,w,w.next)>=0||(w=w.prevZ,x.x>=f&&x.x<=_&&x.y>=p&&x.y<=g&&x!==n&&x!==a&&to(o,h,l,d,c,u,x.x,x.y)&&Ee(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;w&&w.z>=m;){if(w.x>=f&&w.x<=_&&w.y>=p&&w.y<=g&&w!==n&&w!==a&&to(o,h,l,d,c,u,w.x,w.y)&&Ee(w.prev,w,w.next)>=0)return!1;w=w.prevZ}for(;x&&x.z<=y;){if(x.x>=f&&x.x<=_&&x.y>=p&&x.y<=g&&x!==n&&x!==a&&to(o,h,l,d,c,u,x.x,x.y)&&Ee(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function $_(s,t){let e=s;do{let i=e.prev,n=e.next.next;!ta(i,n)&&Lg(i,e,e.next,n)&&Oo(i,n)&&Oo(n,i)&&(t.push(i.i,e.i,n.i),Bo(e),Bo(e.next),e=s=n),e=e.next}while(e!==s);return Gs(e)}function J_(s,t,e,i,n,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&rx(a,o)){let l=Dg(a,o);a=Gs(a,a.next),l=Gs(l,l.next),Fo(a,t,e,i,n,r,0),Fo(l,t,e,i,n,r,0);return}o=o.next}a=a.next}while(a!==s)}function K_(s,t,e,i){let n=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*i,l=r<a-1?t[r+1]*i:s.length,c=Pg(s,o,l,i,!1);c===c.next&&(c.steiner=!0),n.push(sx(c))}n.sort(j_);for(let r=0;r<n.length;r++)e=Q_(n[r],e);return e}function j_(s,t){let e=s.x-t.x;if(e===0&&(e=s.y-t.y,e===0)){let i=(s.next.y-s.y)/(s.next.x-s.x),n=(t.next.y-t.y)/(t.next.x-t.x);e=i-n}return e}function Q_(s,t){let e=tx(s,t);if(!e)return t;let i=Dg(e,s);return Gs(i,i.next),Gs(e,e.next)}function tx(s,t){let e=t,i=s.x,n=s.y,r=-1/0,a;if(ta(s,e))return e;do{if(ta(s,e.next))return e.next;if(n<=e.y&&n>=e.next.y&&e.next.y!==e.y){let d=e.x+(n-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=i&&d>r&&(r=d,a=e.x<e.next.x?e:e.next,d===i))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;e=a;do{if(i>=e.x&&e.x>=l&&i!==e.x&&Ig(n<c?i:r,n,l,c,n<c?r:i,n,e.x,e.y)){let d=Math.abs(n-e.y)/(i-e.x);Oo(e,s)&&(d<h||d===h&&(e.x>a.x||e.x===a.x&&ex(a,e)))&&(a=e,h=d)}e=e.next}while(e!==o);return a}function ex(s,t){return Ee(s.prev,s,t.prev)<0&&Ee(t.next,s,s.next)<0}function ix(s,t,e,i){let n=s;do n.z===0&&(n.z=Fd(n.x,n.y,t,e,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==s);n.prevZ.nextZ=null,n.prevZ=null,nx(n)}function nx(s){let t,e=1;do{let i=s,n;s=null;let r=null;for(t=0;i;){t++;let a=i,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||i.z<=a.z)?(n=i,i=i.nextZ,o--):(n=a,a=a.nextZ,l--),r?r.nextZ=n:s=n,n.prevZ=r,r=n;i=a}r.nextZ=null,e*=2}while(t>1);return s}function Fd(s,t,e,i,n){return s=(s-e)*n|0,t=(t-i)*n|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function sx(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function Ig(s,t,e,i,n,r,a,o){return(n-a)*(t-o)>=(s-a)*(r-o)&&(s-a)*(i-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(n-a)*(i-o)}function to(s,t,e,i,n,r,a,o){return!(s===a&&t===o)&&Ig(s,t,e,i,n,r,a,o)}function rx(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!ax(s,t)&&(Oo(s,t)&&Oo(t,s)&&ox(s,t)&&(Ee(s.prev,s,t.prev)||Ee(s,t.prev,t))||ta(s,t)&&Ee(s.prev,s,s.next)>0&&Ee(t.prev,t,t.next)>0)}function Ee(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function ta(s,t){return s.x===t.x&&s.y===t.y}function Lg(s,t,e,i){let n=Zc(Ee(s,t,e)),r=Zc(Ee(s,t,i)),a=Zc(Ee(e,i,s)),o=Zc(Ee(e,i,t));return!!(n!==r&&a!==o||n===0&&Yc(s,e,t)||r===0&&Yc(s,i,t)||a===0&&Yc(e,s,i)||o===0&&Yc(e,t,i))}function Yc(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function Zc(s){return s>0?1:s<0?-1:0}function ax(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&Lg(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function Oo(s,t){return Ee(s.prev,s,s.next)<0?Ee(s,t,s.next)>=0&&Ee(s,s.prev,t)>=0:Ee(s,t,s.prev)<0||Ee(s,s.next,t)<0}function ox(s,t){let e=s,i=!1,n=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&n<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==s);return i}function Dg(s,t){let e=Od(s.i,s.x,s.y),i=Od(t.i,t.x,t.y),n=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=n,n.prev=e,i.next=e,e.prev=i,r.next=i,i.prev=r,i}function sm(s,t,e,i){let n=Od(s,t,e);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Bo(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Od(s,t,e){return{i:s,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function lx(s,t,e,i){let n=0;for(let r=t,a=e-i;r<e;r+=i)n+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return n}var Bd=class{static triangulate(t,e,i=2){return q_(t,e,i)}},Fi=class s{static area(t){let e=t.length,i=0;for(let n=e-1,r=0;r<e;n=r++)i+=t[n].x*t[r].y-t[r].x*t[n].y;return i*.5}static isClockWise(t){return s.area(t)<0}static triangulateShape(t,e){let i=[],n=[],r=[];rm(t),am(i,t);let a=t.length;e.forEach(rm);for(let l=0;l<e.length;l++)n.push(a),a+=e[l].length,am(i,e[l]);let o=Bd.triangulate(i,n);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function rm(s){let t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function am(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}var Hs=class s extends kt{constructor(t=new zi([new q(.5,.5),new q(-.5,.5),new q(-.5,-.5),new q(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let i=this,n=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new vt(n,3)),this.setAttribute("uv",new vt(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,d=e.depth!==void 0?e.depth:1,u=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,p=e.bevelSize!==void 0?e.bevelSize:f-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,g=e.bevelSegments!==void 0?e.bevelSegments:3,m=e.extrudePath,y=e.UVGenerator!==void 0?e.UVGenerator:cx,w,x=!1,M,S,A,v;if(m){w=m.getSpacedPoints(h),x=!0,u=!1;let it=m.isCatmullRomCurve3?m.closed:!1;M=m.computeFrenetFrames(h,it),S=new C,A=new C,v=new C}u||(g=0,f=0,p=0,_=0);let E=o.extractPoints(c),P=E.shape,I=E.holes;if(!Fi.isClockWise(P)){P=P.reverse();for(let it=0,ot=I.length;it<ot;it++){let lt=I[it];Fi.isClockWise(lt)&&(I[it]=lt.reverse())}}function B(it){let lt=10000000000000001e-36,ct=it[0];for(let ft=1;ft<=it.length;ft++){let Vt=ft%it.length,zt=it[Vt],Yt=zt.x-ct.x,$t=zt.y-ct.y,L=Yt*Yt+$t*$t,de=Math.max(Math.abs(zt.x),Math.abs(zt.y),Math.abs(ct.x),Math.abs(ct.y)),ne=lt*de*de;if(L<=ne){it.splice(Vt,1),ft--;continue}ct=zt}}B(P),I.forEach(B);let D=I.length,z=P;for(let it=0;it<D;it++){let ot=I[it];P=P.concat(ot)}function X(it,ot,lt){return ot||Dt("ExtrudeGeometry: vec does not exist"),it.clone().addScaledVector(ot,lt)}let W=P.length;function rt(it,ot,lt){let ct,ft,Vt,zt=it.x-ot.x,Yt=it.y-ot.y,$t=lt.x-it.x,L=lt.y-it.y,de=zt*zt+Yt*Yt,ne=zt*L-Yt*$t;if(Math.abs(ne)>Number.EPSILON){let R=Math.sqrt(de),b=Math.sqrt($t*$t+L*L),O=ot.x-Yt/R,G=ot.y+zt/R,Z=lt.x-L/b,ht=lt.y+$t/b,dt=((Z-O)*L-(ht-G)*$t)/(zt*L-Yt*$t);ct=O+zt*dt-it.x,ft=G+Yt*dt-it.y;let $=ct*ct+ft*ft;if($<=2)return new q(ct,ft);Vt=Math.sqrt($/2)}else{let R=!1;zt>Number.EPSILON?$t>Number.EPSILON&&(R=!0):zt<-Number.EPSILON?$t<-Number.EPSILON&&(R=!0):Math.sign(Yt)===Math.sign(L)&&(R=!0),R?(ct=-Yt,ft=zt,Vt=Math.sqrt(de)):(ct=zt,ft=Yt,Vt=Math.sqrt(de/2))}return new q(ct/Vt,ft/Vt)}let Y=[];for(let it=0,ot=z.length,lt=ot-1,ct=it+1;it<ot;it++,lt++,ct++)lt===ot&&(lt=0),ct===ot&&(ct=0),Y[it]=rt(z[it],z[lt],z[ct]);let tt=[],nt,Ut=Y.concat();for(let it=0,ot=D;it<ot;it++){let lt=I[it];nt=[];for(let ct=0,ft=lt.length,Vt=ft-1,zt=ct+1;ct<ft;ct++,Vt++,zt++)Vt===ft&&(Vt=0),zt===ft&&(zt=0),nt[ct]=rt(lt[ct],lt[Vt],lt[zt]);tt.push(nt),Ut=Ut.concat(nt)}let Rt;if(g===0)Rt=Fi.triangulateShape(z,I);else{let it=[],ot=[];for(let lt=0;lt<g;lt++){let ct=lt/g,ft=f*Math.cos(ct*Math.PI/2),Vt=p*Math.sin(ct*Math.PI/2)+_;for(let zt=0,Yt=z.length;zt<Yt;zt++){let $t=X(z[zt],Y[zt],Vt);bt($t.x,$t.y,-ft),ct===0&&it.push($t)}for(let zt=0,Yt=D;zt<Yt;zt++){let $t=I[zt];nt=tt[zt];let L=[];for(let de=0,ne=$t.length;de<ne;de++){let R=X($t[de],nt[de],Vt);bt(R.x,R.y,-ft),ct===0&&L.push(R)}ct===0&&ot.push(L)}}Rt=Fi.triangulateShape(it,ot)}let ue=Rt.length,ie=p+_;for(let it=0;it<W;it++){let ot=u?X(P[it],Ut[it],ie):P[it];x?(A.copy(M.normals[0]).multiplyScalar(ot.x),S.copy(M.binormals[0]).multiplyScalar(ot.y),v.copy(w[0]).add(A).add(S),bt(v.x,v.y,v.z)):bt(ot.x,ot.y,0)}for(let it=1;it<=h;it++)for(let ot=0;ot<W;ot++){let lt=u?X(P[ot],Ut[ot],ie):P[ot];x?(A.copy(M.normals[it]).multiplyScalar(lt.x),S.copy(M.binormals[it]).multiplyScalar(lt.y),v.copy(w[it]).add(A).add(S),bt(v.x,v.y,v.z)):bt(lt.x,lt.y,d/h*it)}for(let it=g-1;it>=0;it--){let ot=it/g,lt=f*Math.cos(ot*Math.PI/2),ct=p*Math.sin(ot*Math.PI/2)+_;for(let ft=0,Vt=z.length;ft<Vt;ft++){let zt=X(z[ft],Y[ft],ct);bt(zt.x,zt.y,d+lt)}for(let ft=0,Vt=I.length;ft<Vt;ft++){let zt=I[ft];nt=tt[ft];for(let Yt=0,$t=zt.length;Yt<$t;Yt++){let L=X(zt[Yt],nt[Yt],ct);x?bt(L.x,L.y+w[h-1].y,w[h-1].x+lt):bt(L.x,L.y,d+lt)}}}ae(),J();function ae(){let it=n.length/3;if(u){let ot=0,lt=W*ot;for(let ct=0;ct<ue;ct++){let ft=Rt[ct];Wt(ft[2]+lt,ft[1]+lt,ft[0]+lt)}ot=h+g*2,lt=W*ot;for(let ct=0;ct<ue;ct++){let ft=Rt[ct];Wt(ft[0]+lt,ft[1]+lt,ft[2]+lt)}}else{for(let ot=0;ot<ue;ot++){let lt=Rt[ot];Wt(lt[2],lt[1],lt[0])}for(let ot=0;ot<ue;ot++){let lt=Rt[ot];Wt(lt[0]+W*h,lt[1]+W*h,lt[2]+W*h)}}i.addGroup(it,n.length/3-it,0)}function J(){let it=n.length/3,ot=0;et(z,ot),ot+=z.length;for(let lt=0,ct=I.length;lt<ct;lt++){let ft=I[lt];et(ft,ot),ot+=ft.length}i.addGroup(it,n.length/3-it,1)}function et(it,ot){let lt=it.length;for(;--lt>=0;){let ct=lt,ft=lt-1;ft<0&&(ft=it.length-1);for(let Vt=0,zt=h+g*2;Vt<zt;Vt++){let Yt=W*Vt,$t=W*(Vt+1),L=ot+ct+Yt,de=ot+ft+Yt,ne=ot+ft+$t,R=ot+ct+$t;Et(L,de,ne,R)}}}function bt(it,ot,lt){l.push(it),l.push(ot),l.push(lt)}function Wt(it,ot,lt){qt(it),qt(ot),qt(lt);let ct=n.length/3,ft=y.generateTopUV(i,n,ct-3,ct-2,ct-1);_e(ft[0]),_e(ft[1]),_e(ft[2])}function Et(it,ot,lt,ct){qt(it),qt(ot),qt(ct),qt(ot),qt(lt),qt(ct);let ft=n.length/3,Vt=y.generateSideWallUV(i,n,ft-6,ft-3,ft-2,ft-1);_e(Vt[0]),_e(Vt[1]),_e(Vt[3]),_e(Vt[1]),_e(Vt[2]),_e(Vt[3])}function qt(it){n.push(l[it*3+0]),n.push(l[it*3+1]),n.push(l[it*3+2])}function _e(it){r.push(it.x),r.push(it.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return hx(e,i,t)}static fromJSON(t,e){let i=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];i.push(o)}let n=t.options.extrudePath;return n!==void 0&&(t.options.extrudePath=new Sh[n.type]().fromJSON(n)),new s(i,t.options)}},cx={generateTopUV:function(s,t,e,i,n){let r=t[e*3],a=t[e*3+1],o=t[i*3],l=t[i*3+1],c=t[n*3],h=t[n*3+1];return[new q(r,a),new q(o,l),new q(c,h)]},generateSideWallUV:function(s,t,e,i,n,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[i*3],h=t[i*3+1],d=t[i*3+2],u=t[n*3],f=t[n*3+1],p=t[n*3+2],_=t[r*3],g=t[r*3+1],m=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new q(a,1-l),new q(c,1-d),new q(u,1-p),new q(_,1-m)]:[new q(o,1-l),new q(h,1-d),new q(f,1-p),new q(g,1-m)]}};function hx(s,t,e){if(e.shapes=[],Array.isArray(s))for(let i=0,n=s.length;i<n;i++){let r=s[i];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var ss=class s extends Dn{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}},zo=class s extends kt{constructor(t=[new q(0,-.5),new q(.5,0),new q(0,.5)],e=12,i=0,n=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:n},e=Math.floor(e),n=Xt(n,0,Math.PI*2);let r=[],a=[],o=[],l=[],c=[],h=1/e,d=new C,u=new q,f=new C,p=new C,_=new C,g=0,m=0;for(let y=0;y<=t.length-1;y++)switch(y){case 0:g=t[y+1].x-t[y].x,m=t[y+1].y-t[y].y,f.x=m*1,f.y=-g,f.z=m*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(_.x,_.y,_.z);break;default:g=t[y+1].x-t[y].x,m=t[y+1].y-t[y].y,f.x=m*1,f.y=-g,f.z=m*0,p.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(p)}for(let y=0;y<=e;y++){let w=i+y*h*n,x=Math.sin(w),M=Math.cos(w);for(let S=0;S<=t.length-1;S++){d.x=t[S].x*x,d.y=t[S].y,d.z=t[S].x*M,a.push(d.x,d.y,d.z),u.x=y/e,u.y=S/(t.length-1),o.push(u.x,u.y);let A=l[3*S+0]*x,v=l[3*S+1],E=l[3*S+0]*M;c.push(A,v,E)}}for(let y=0;y<e;y++)for(let w=0;w<t.length-1;w++){let x=w+y*t.length,M=x,S=x+t.length,A=x+t.length+1,v=x+1;r.push(M,S,v),r.push(A,v,S)}this.setIndex(r),this.setAttribute("position",new vt(a,3)),this.setAttribute("uv",new vt(o,2)),this.setAttribute("normal",new vt(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.points,t.segments,t.phiStart,t.phiLength)}},ki=class s extends Dn{constructor(t=1,e=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],n=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,n,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}},Ci=class s extends kt{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let r=t/2,a=e/2,o=Math.floor(i),l=Math.floor(n),c=o+1,h=l+1,d=t/o,u=e/l,f=[],p=[],_=[],g=[];for(let m=0;m<h;m++){let y=m*u-a;for(let w=0;w<c;w++){let x=w*d-r;p.push(x,-y,0),_.push(0,0,1),g.push(w/o),g.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<o;y++){let w=y+c*m,x=y+c*(m+1),M=y+1+c*(m+1),S=y+1+c*m;f.push(w,x,S),f.push(x,M,S)}this.setIndex(f),this.setAttribute("position",new vt(p,3)),this.setAttribute("normal",new vt(_,3)),this.setAttribute("uv",new vt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},rs=class s extends kt{constructor(t=.5,e=1,i=32,n=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:n,thetaStart:r,thetaLength:a},i=Math.max(3,i),n=Math.max(1,n);let o=[],l=[],c=[],h=[],d=t,u=(e-t)/n,f=new C,p=new q;for(let _=0;_<=n;_++){for(let g=0;g<=i;g++){let m=r+g/i*a;f.x=d*Math.cos(m),f.y=d*Math.sin(m),l.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/e+1)/2,p.y=(f.y/e+1)/2,h.push(p.x,p.y)}d+=u}for(let _=0;_<n;_++){let g=_*(i+1);for(let m=0;m<i;m++){let y=m+g,w=y,x=y+i+1,M=y+i+2,S=y+1;o.push(w,x,S),o.push(x,M,S)}}this.setIndex(o),this.setAttribute("position",new vt(l,3)),this.setAttribute("normal",new vt(c,3)),this.setAttribute("uv",new vt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Ws=class s extends kt{constructor(t=new zi([new q(0,.5),new q(-.5,-.5),new q(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let i=[],n=[],r=[],a=[],o=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(o,l,h),o+=l,l=0;this.setIndex(i),this.setAttribute("position",new vt(n,3)),this.setAttribute("normal",new vt(r,3)),this.setAttribute("uv",new vt(a,2));function c(h){let d=n.length/3,u=h.extractPoints(e),f=u.shape,p=u.holes;Fi.isClockWise(f)===!1&&(f=f.reverse());for(let g=0,m=p.length;g<m;g++){let y=p[g];Fi.isClockWise(y)===!0&&(p[g]=y.reverse())}let _=Fi.triangulateShape(f,p);for(let g=0,m=p.length;g<m;g++){let y=p[g];f=f.concat(y)}for(let g=0,m=f.length;g<m;g++){let y=f[g];n.push(y.x,y.y,0),r.push(0,0,1),a.push(y.x,y.y)}for(let g=0,m=_.length;g<m;g++){let y=_[g],w=y[0]+d,x=y[1]+d,M=y[2]+d;i.push(w,x,M),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return ux(e,t)}static fromJSON(t,e){let i=[];for(let n=0,r=t.shapes.length;n<r;n++){let a=e[t.shapes[n]];i.push(a)}return new s(i,t.curveSegments)}};function ux(s,t){if(t.shapes=[],Array.isArray(s))for(let e=0,i=s.length;e<i;e++){let n=s[e];t.shapes.push(n.uuid)}else t.shapes.push(s.uuid);return t}var ea=class s extends kt{constructor(t=1,e=32,i=16,n=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new C,u=new C,f=[],p=[],_=[],g=[];for(let m=0;m<=i;m++){let y=[],w=m/i,x=a+w*o,M=t*Math.cos(x),S=Math.sqrt(t*t-M*M),A=0;m===0&&a===0?A=.5/e:m===i&&l===Math.PI&&(A=-.5/e);for(let v=0;v<=e;v++){let E=v/e,P=n+E*r;d.x=-S*Math.cos(P),d.y=M,d.z=S*Math.sin(P),p.push(d.x,d.y,d.z),u.copy(d).normalize(),_.push(u.x,u.y,u.z),g.push(E+A,1-w),y.push(c++)}h.push(y)}for(let m=0;m<i;m++)for(let y=0;y<e;y++){let w=h[m][y+1],x=h[m][y],M=h[m+1][y],S=h[m+1][y+1];(m!==0||a>0)&&f.push(w,x,S),(m!==i-1||l<Math.PI)&&f.push(x,M,S)}this.setIndex(f),this.setAttribute("position",new vt(p,3)),this.setAttribute("normal",new vt(_,3)),this.setAttribute("uv",new vt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},ko=class s extends Dn{constructor(t=1,e=0){let i=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],n=[2,1,0,0,3,2,1,3,0,2,3,1];super(i,n,t,e),this.type="TetrahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}},en=class s extends kt{constructor(t=1,e=.4,i=12,n=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:n,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),n=Math.floor(n);let l=[],c=[],h=[],d=[],u=new C,f=new C,p=new C;for(let _=0;_<=i;_++){let g=a+_/i*o;for(let m=0;m<=n;m++){let y=m/n*r;f.x=(t+e*Math.cos(g))*Math.cos(y),f.y=(t+e*Math.cos(g))*Math.sin(y),f.z=e*Math.sin(g),c.push(f.x,f.y,f.z),u.x=t*Math.cos(y),u.y=t*Math.sin(y),p.subVectors(f,u).normalize(),h.push(p.x,p.y,p.z),d.push(m/n),d.push(_/i)}}for(let _=1;_<=i;_++)for(let g=1;g<=n;g++){let m=(n+1)*_+g-1,y=(n+1)*(_-1)+g-1,w=(n+1)*(_-1)+g,x=(n+1)*_+g;l.push(m,y,x),l.push(y,w,x)}this.setIndex(l),this.setAttribute("position",new vt(c,3)),this.setAttribute("normal",new vt(h,3)),this.setAttribute("uv",new vt(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}},Vo=class s extends kt{constructor(t=1,e=.4,i=64,n=8,r=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:t,tube:e,tubularSegments:i,radialSegments:n,p:r,q:a},i=Math.floor(i),n=Math.floor(n);let o=[],l=[],c=[],h=[],d=new C,u=new C,f=new C,p=new C,_=new C,g=new C,m=new C;for(let w=0;w<=i;++w){let x=w/i*r*Math.PI*2;y(x,r,a,t,f),y(x+.01,r,a,t,p),g.subVectors(p,f),m.addVectors(p,f),_.crossVectors(g,m),m.crossVectors(_,g),_.normalize(),m.normalize();for(let M=0;M<=n;++M){let S=M/n*Math.PI*2,A=-e*Math.cos(S),v=e*Math.sin(S);d.x=f.x+(A*m.x+v*_.x),d.y=f.y+(A*m.y+v*_.y),d.z=f.z+(A*m.z+v*_.z),l.push(d.x,d.y,d.z),u.subVectors(d,f).normalize(),c.push(u.x,u.y,u.z),h.push(w/i),h.push(M/n)}}for(let w=1;w<=i;w++)for(let x=1;x<=n;x++){let M=(n+1)*(w-1)+(x-1),S=(n+1)*w+(x-1),A=(n+1)*w+x,v=(n+1)*(w-1)+x;o.push(M,S,v),o.push(S,A,v)}this.setIndex(o),this.setAttribute("position",new vt(l,3)),this.setAttribute("normal",new vt(c,3)),this.setAttribute("uv",new vt(h,2));function y(w,x,M,S,A){let v=Math.cos(w),E=Math.sin(w),P=M/x*w,I=Math.cos(P);A.x=S*(2+I)*.5*v,A.y=S*(2+I)*E*.5,A.z=S*Math.sin(P)*.5}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.tubularSegments,t.radialSegments,t.p,t.q)}},Go=class s extends kt{constructor(t=new jr(new C(-1,-1,0),new C(-1,1,0),new C(1,1,0)),e=64,i=1,n=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:i,radialSegments:n,closed:r};let a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new C,l=new C,c=new q,h=new C,d=[],u=[],f=[],p=[];_(),this.setIndex(p),this.setAttribute("position",new vt(d,3)),this.setAttribute("normal",new vt(u,3)),this.setAttribute("uv",new vt(f,2));function _(){for(let w=0;w<e;w++)g(w);g(r===!1?e:0),y(),m()}function g(w){h=t.getPointAt(w/e,h);let x=a.normals[w],M=a.binormals[w];for(let S=0;S<=n;S++){let A=S/n*Math.PI*2,v=Math.sin(A),E=-Math.cos(A);l.x=E*x.x+v*M.x,l.y=E*x.y+v*M.y,l.z=E*x.z+v*M.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=h.x+i*l.x,o.y=h.y+i*l.y,o.z=h.z+i*l.z,d.push(o.x,o.y,o.z)}}function m(){for(let w=1;w<=e;w++)for(let x=1;x<=n;x++){let M=(n+1)*(w-1)+(x-1),S=(n+1)*w+(x-1),A=(n+1)*w+x,v=(n+1)*(w-1)+x;p.push(M,S,v),p.push(S,A,v)}}function y(){for(let w=0;w<=e;w++)for(let x=0;x<=n;x++)c.x=w/e,c.y=x/n,f.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new s(new Sh[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}},Ho=class extends kt{constructor(t=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:t},t!==null){let e=[],i=new Set,n=new C,r=new C;if(t.index!==null){let a=t.attributes.position,o=t.index,l=t.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,h=l.length;c<h;++c){let d=l[c],u=d.start,f=d.count;for(let p=u,_=u+f;p<_;p+=3)for(let g=0;g<3;g++){let m=o.getX(p+g),y=o.getX(p+(g+1)%3);n.fromBufferAttribute(a,m),r.fromBufferAttribute(a,y),om(n,r,i)===!0&&(e.push(n.x,n.y,n.z),e.push(r.x,r.y,r.z))}}}else{let a=t.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){let h=3*o+c,d=3*o+(c+1)%3;n.fromBufferAttribute(a,h),r.fromBufferAttribute(a,d),om(n,r,i)===!0&&(e.push(n.x,n.y,n.z),e.push(r.x,r.y,r.z))}}this.setAttribute("position",new vt(e,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}};function om(s,t,e){let i=`${s.x},${s.y},${s.z}-${t.x},${t.y},${t.z}`,n=`${t.x},${t.y},${t.z}-${s.x},${s.y},${s.z}`;return e.has(i)===!0||e.has(n)===!0?!1:(e.add(i),e.add(n),!0)}var lm=Object.freeze({__proto__:null,BoxGeometry:Ke,CapsuleGeometry:Ao,CircleGeometry:Co,ConeGeometry:Zr,CylinderGeometry:Bi,DodecahedronGeometry:Ro,EdgesGeometry:Po,ExtrudeGeometry:Hs,IcosahedronGeometry:ss,LatheGeometry:zo,OctahedronGeometry:ki,PlaneGeometry:Ci,PolyhedronGeometry:Dn,RingGeometry:rs,ShapeGeometry:Ws,SphereGeometry:ea,TetrahedronGeometry:ko,TorusGeometry:en,TorusKnotGeometry:Vo,TubeGeometry:Go,WireframeGeometry:Ho}),Wo=class extends Ve{constructor(t){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new at(0),this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.fog=t.fog,this}};function ar(s){let t={};for(let e in s){t[e]={};for(let i in s[e]){let n=s[e][i];if(cm(n))n.isRenderTargetTexture?(pt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(cm(n[0])){let r=[];for(let a=0,o=n.length;a<o;a++)r[a]=n[a].clone();t[e][i]=r}else t[e][i]=n.slice();else t[e][i]=n}}return t}function ai(s){let t={};for(let e=0;e<s.length;e++){let i=ar(s[e]);for(let n in i)t[n]=i[n]}return t}function cm(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function dx(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Df(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:te.workingColorSpace}var yn={clone:ar,merge:ai},fx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,px=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ce=class extends Ve{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=fx,this.fragmentShader=px,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ar(t.uniforms),this.uniformsGroups=dx(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let a=this.uniforms[n].value;a&&a.isTexture?e.uniforms[n]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[n]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[n]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[n]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[n]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[n]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[n]={type:"m4",value:a.toArray()}:e.uniforms[n]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new at().setHex(n.value);break;case"v2":this.uniforms[i].value=new q().fromArray(n.value);break;case"v3":this.uniforms[i].value=new C().fromArray(n.value);break;case"v4":this.uniforms[i].value=new ge().fromArray(n.value);break;case"m3":this.uniforms[i].value=new Zt().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Ht().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},as=class extends Ce{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ge=class extends Ve{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new at(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new at(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xn,this.normalScale=new q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Xo=class extends Ge{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new q(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Xt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new at(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new at(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new at(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}},qo=class extends Ve{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new at(16777215),this.specular=new at(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new at(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xn,this.normalScale=new q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.combine=pa,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Yo=class extends Ve{constructor(t){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new at(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new at(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xn,this.normalScale=new q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.gradientMap=t.gradientMap,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.alphaMap=t.alphaMap,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Zo=class extends Ve{constructor(t){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xn,this.normalScale=new q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(t)}copy(t){return super.copy(t),this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.flatShading=t.flatShading,this}},$o=class extends Ve{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new at(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new at(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xn,this.normalScale=new q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.combine=pa,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ia=class extends Ve{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Mf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},na=class extends Ve{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},Jo=class extends Ve{constructor(t){super(),this.isMeshMatcapMaterial=!0,this.defines={MATCAP:""},this.type="MeshMatcapMaterial",this.color=new at(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xn,this.normalScale=new q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={MATCAP:""},this.color.copy(t.color),this.matcap=t.matcap,this.map=t.map,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.alphaMap=t.alphaMap,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.flatShading=t.flatShading,this.fog=t.fog,this}},Ko=class extends Ze{constructor(t){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(t)}copy(t){return super.copy(t),this.scale=t.scale,this.dashSize=t.dashSize,this.gapSize=t.gapSize,this}};function $i(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function ao(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}function Ng(s){function t(n,r){return s[n]-s[r]}let e=s.length,i=new Array(e);for(let n=0;n!==e;++n)i[n]=n;return i.sort(t),i}function zd(s,t,e){let i=s.length,n=new s.constructor(i);for(let r=0,a=0;a!==i;++r){let o=e[r]*t;for(let l=0;l!==t;++l)n[a++]=s[o+l]}return n}function Ug(s,t,e,i){let n=1,r=s[0];for(;r!==void 0&&r[i]===void 0;)r=s[n++];if(r===void 0)return;let a=r[i];if(a!==void 0)if(Array.isArray(a))do a=r[i],a!==void 0&&(t.push(r.time),e.push(...a)),r=s[n++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[i],a!==void 0&&(t.push(r.time),a.toArray(e,e.length)),r=s[n++];while(r!==void 0);else do a=r[i],a!==void 0&&(t.push(r.time),e.push(a)),r=s[n++];while(r!==void 0)}function mx(s,t,e,i,n=30){let r=s.clone();r.name=t;let a=[];for(let l=0;l<r.tracks.length;++l){let c=r.tracks[l],h=c.getValueSize(),d=[],u=[];for(let f=0;f<c.times.length;++f){let p=c.times[f]*n;if(!(p<e||p>=i)){d.push(c.times[f]);for(let _=0;_<h;++_)u.push(c.values[f*h+_])}}d.length!==0&&(c.times=$i(d,c.times.constructor),c.values=$i(u,c.values.constructor),a.push(c))}r.tracks=a;let o=1/0;for(let l=0;l<r.tracks.length;++l)o>r.tracks[l].times[0]&&(o=r.tracks[l].times[0]);for(let l=0;l<r.tracks.length;++l)r.tracks[l].shift(-1*o);return r.resetDuration(),r}function gx(s,t=0,e=s,i=30){i<=0&&(i=30);let n=e.tracks.length,r=t/i;for(let a=0;a<n;++a){let o=e.tracks[a],l=o.ValueTypeName;if(l==="bool"||l==="string")continue;let c=s.tracks.find(function(m){return m.name===o.name&&m.ValueTypeName===l});if(c===void 0)continue;let h=0,d=o.getValueSize();o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(h=d/3);let u=0,f=c.getValueSize();c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(u=f/3);let p=o.times.length-1,_;if(r<=o.times[0]){let m=h,y=d-h;_=o.values.slice(m,y)}else if(r>=o.times[p]){let m=p*d+h,y=m+d-h;_=o.values.slice(m,y)}else{let m=o.createInterpolant(),y=h,w=d-h;m.evaluate(r),_=m.resultBuffer.slice(y,w)}l==="quaternion"&&new Te().fromArray(_).normalize().conjugate().toArray(_);let g=c.times.length;for(let m=0;m<g;++m){let y=m*f+u;if(l==="quaternion")Te.multiplyQuaternionsFlat(c.values,y,_,0,c.values,y);else{let w=f-u*2;for(let x=0;x<w;++x)c.values[y+x]-=_[x]}}}return s.blendMode=Mu,s}var wh=class{static convertArray(t,e){return $i(t,e)}static isTypedArray(t){return bg(t)}static hasTangents(t){return ao(t)}static getKeyframeOrder(t){return Ng(t)}static sortedArray(t,e,i){return zd(t,e,i)}static flattenJSON(t,e,i,n){Ug(t,e,i,n)}static subclip(t,e,i,n,r=30){return mx(t,e,i,n,r)}static makeClipAdditive(t,e=0,i=t,n=30){return gx(t,e,i,n)}},Nn=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],r=e[i-1];t:{e:{let a;i:{n:if(!(t<n)){for(let o=i+2;;){if(n===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=n,n=e[++i],t<n)break e}a=e.length;break i}if(!(t>=r)){let o=e[1];t<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(n=r,r=e[--i-1],t>=r)break e}a=i,i=0;break i}break t}for(;i<a;){let o=i+a>>>1;t<e[o]?a=o:i=o+1}if(n=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=t*n;for(let a=0;a!==n;++a)e[a]=i[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},jo=class extends Nn{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Jn,endingEnd:Jn}}intervalChanged_(t,e,i){let n=this.parameterPositions,r=t-2,a=t+1,o=n[r],l=n[a];if(o===void 0)switch(this.getSettings_().endingStart){case Kn:r=t,o=2*e-i;break;case Br:r=n.length-2,o=e+n[r]-n[r+1];break;default:r=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Kn:a=t,l=2*i-e;break;case Br:a=1,l=i+n[1]-n[0];break;default:a=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,p=(i-e)/(n-e),_=p*p,g=_*p,m=-u*g+2*u*_-u*p,y=(1+u)*g+(-1.5-2*u)*_+(-.5+u)*p+1,w=(-1-f)*g+(1.5+f)*_+.5*p,x=f*g-f*_;for(let M=0;M!==o;++M)r[M]=m*a[h+M]+y*a[c+M]+w*a[l+M]+x*a[d+M];return r}},sa=class extends Nn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(i-e)/(n-e),d=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*d+a[l+u]*h;return r}},Qo=class extends Nn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},tl=class extends Nn{interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let p=(i-e)/(n-e),_=1-p;for(let g=0;g!==o;++g)r[g]=a[c+g]*_+a[l+g]*p;return r}let u=o*2,f=t-1;for(let p=0;p!==o;++p){let _=a[c+p],g=a[l+p],m=f*u+p*2,y=d[m],w=d[m+1],x=t*u+p*2,M=h[x],S=h[x+1],A=xx(i,e,y,M,n);r[p]=Fg(A,_,w,S,g)}return r}};function Fg(s,t,e,i,n){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*i+s*s*s*n}function _x(s,t,e,i,n){let r=1-s;return 3*r*r*(e-t)+6*r*s*(i-e)+3*s*s*(n-i)}function xx(s,t,e,i,n){let r=(s-t)/(n-t);for(let a=0;a<8;a++){let o=Fg(r,t,e,i,n)-s;if(Math.abs(o)<1e-10)break;let l=_x(r,t,e,i,n);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var di=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=$i(e,this.TimeBufferType),this.values=$i(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:$i(t.times,Array),values:$i(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),ao(t.settings)&&(i.settings={inTangents:$i(t.settings.inTangents,Array),outTangents:$i(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Qo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new sa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new jo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new tl(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Or:e=this.InterpolantFactoryMethodDiscrete;break;case mo:e=this.InterpolantFactoryMethodLinear;break;case eo:e=this.InterpolantFactoryMethodSmooth;break;case rh:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return pt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Or;case this.InterpolantFactoryMethodLinear:return mo;case this.InterpolantFactoryMethodSmooth:return eo;case this.InterpolantFactoryMethodBezier:return rh}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;ao(this.settings)&&(hm(this.settings.inTangents,t),hm(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,r=0,a=n-1;for(;r!==n&&i[r]<t;)++r;for(;a!==-1&&i[a]>e;)--a;if(++a,r!==0||a!==n){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Dt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,r=i.length;r===0&&(Dt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Dt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Dt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(n!==void 0&&bg(n))for(let o=0,l=n.length;o!==l;++o){let c=n[o];if(isNaN(c)){Dt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===eo,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(n)l=!0;else{let d=o*i,u=d-i,f=d+i;for(let p=0;p!==i;++p){let _=e[d+p];if(_!==e[u+p]||_!==e[f+p]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let d=o*i,u=a*i;for(let f=0;f!==i;++f)e[u+f]=e[d+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,ao(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function hm(s,t){for(let e=0,i=s.length;e!==i;e+=2)s[e]*=t}di.prototype.ValueTypeName="";di.prototype.TimeBufferType=Float32Array;di.prototype.ValueBufferType=Float32Array;di.prototype.DefaultInterpolation=mo;var mn=class extends di{constructor(t,e,i){super(t,e,i)}};mn.prototype.ValueTypeName="bool";mn.prototype.ValueBufferType=Array;mn.prototype.DefaultInterpolation=Or;mn.prototype.InterpolantFactoryMethodLinear=void 0;mn.prototype.InterpolantFactoryMethodSmooth=void 0;var ra=class extends di{constructor(t,e,i,n){super(t,e,i,n)}};ra.prototype.ValueTypeName="color";var Xs=class extends di{constructor(t,e,i,n){super(t,e,i,n)}};Xs.prototype.ValueTypeName="number";var el=class extends Nn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-e)/(n-e),c=t*o;for(let h=c+o;c!==h;c+=4)Te.slerpFlat(r,0,a,c-o,a,c,l);return r}},qs=class extends di{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new el(this.times,this.values,this.getValueSize(),t)}};qs.prototype.ValueTypeName="quaternion";qs.prototype.InterpolantFactoryMethodSmooth=void 0;var gn=class extends di{constructor(t,e,i){super(t,e,i)}};gn.prototype.ValueTypeName="string";gn.prototype.ValueBufferType=Array;gn.prototype.DefaultInterpolation=Or;gn.prototype.InterpolantFactoryMethodLinear=void 0;gn.prototype.InterpolantFactoryMethodSmooth=void 0;var aa=class extends di{constructor(t,e,i,n){super(t,e,i,n)}};aa.prototype.ValueTypeName="vector";var os=class{constructor(t="",e=-1,i=[],n=Kl){this.name=t,this.tracks=i,this.duration=e,this.blendMode=n,this.uuid=Ei(),this.userData={},this.duration<0&&this.resetDuration()}static parse(t){let e=[],i=t.tracks,n=1/(t.fps||1);for(let a=0,o=i.length;a!==o;++a)e.push(yx(i[a]).scale(n));let r=new this(t.name,t.duration,e,t.blendMode);return r.uuid=t.uuid,r.userData=JSON.parse(t.userData||"{}"),r}static toJSON(t){let e=[],i=t.tracks,n={name:t.name,duration:t.duration,tracks:e,uuid:t.uuid,blendMode:t.blendMode,userData:JSON.stringify(t.userData)};for(let r=0,a=i.length;r!==a;++r)e.push(di.toJSON(i[r]));return n}static CreateFromMorphTargetSequence(t,e,i,n){let r=e.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);let h=Ng(l);l=zd(l,1,h),c=zd(c,1,h),!n&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new Xs(".morphTargetInfluences["+e[o].name+"]",l,c).scale(1/i))}return new this(t,-1,a)}static findByName(t,e){let i=t;if(!Array.isArray(t)){let n=t;i=n.geometry&&n.geometry.animations||n.animations}for(let n=0;n<i.length;n++)if(i[n].name===e)return i[n];return null}static CreateClipsFromMorphTargetSequences(t,e,i){let n={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=t.length;o<l;o++){let c=t[o],h=c.name.match(r);if(h&&h.length>1){let d=h[1],u=n[d];u||(n[d]=u=[]),u.push(c)}}let a=[];for(let o in n)a.push(this.CreateFromMorphTargetSequence(o,n[o],e,i));return a}resetDuration(){let t=this.tracks,e=0;for(let i=0,n=t.length;i!==n;++i){let r=this.tracks[i];e=Math.max(e,r.times[r.times.length-1])}return this.duration=e,this}trim(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].trim(0,this.duration);return this}validate(){let t=!0;for(let e=0;e<this.tracks.length;e++)t=t&&this.tracks[e].validate();return t}optimize(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].optimize();return this}clone(){let t=[];for(let i=0;i<this.tracks.length;i++)t.push(this.tracks[i].clone());let e=new this.constructor(this.name,this.duration,t,this.blendMode);return e.userData=JSON.parse(JSON.stringify(this.userData)),e}toJSON(){return this.constructor.toJSON(this)}};function vx(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Xs;case"vector":case"vector2":case"vector3":case"vector4":return aa;case"color":return ra;case"quaternion":return qs;case"bool":case"boolean":return mn;case"string":return gn}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function yx(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let t=vx(s.type);if(s.times===void 0){let i=[],n=[];Ug(s.keys,i,n,"value"),s.times=i,s.values=n}let e;return t.parse!==void 0?e=t.parse(s):e=new t(s.name,s.times,s.values,s.interpolation),ao(s.settings)&&(e.settings={inTangents:$i(s.settings.inTangents,Float32Array),outTangents:$i(s.settings.outTangents,Float32Array)}),e}var Ki={enabled:!1,files:{},add:function(s,t){this.enabled!==!1&&(um(s)||(this.files[s]=t))},get:function(s){if(this.enabled!==!1&&!um(s))return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};function um(s){try{let t=s.slice(s.indexOf(":")+1);return new URL(t).protocol==="blob:"}catch{return!1}}var oa=class{constructor(t,e,i){let n=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&n.onStart!==void 0&&n.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,n.onProgress!==void 0&&n.onProgress(h,a,o),a===o&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let f=c[d],p=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Nf=new oa,je=class{constructor(t){this.manager=t!==void 0?t:Nf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,r){i.load(t,n,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};je.DEFAULT_MATERIAL_NAME="__DEFAULT";var Cn={},kd=class extends Error{constructor(t,e){super(t),this.response=e}},Vi=class extends je{constructor(t){super(t),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(t,e,i,n){t===void 0&&(t=""),this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let r=Ki.get(`file:${t}`);if(r!==void 0){this.manager.itemStart(t),setTimeout(()=>{e&&e(r),this.manager.itemEnd(t)},0);return}if(Cn[t]!==void 0){Cn[t].push({onLoad:e,onProgress:i,onError:n});return}Cn[t]=[],Cn[t].push({onLoad:e,onProgress:i,onError:n});let a=new Request(t,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&pt("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let h=Cn[t],d=c.body.getReader(),u=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=u?parseInt(u):0,p=f!==0,_=0,g=new ReadableStream({start(m){y();function y(){d.read().then(({done:w,value:x})=>{if(w)m.close();else{_+=x.byteLength;let M=new ProgressEvent("progress",{lengthComputable:p,loaded:_,total:f});for(let S=0,A=h.length;S<A;S++){let v=h[S];v.onProgress&&v.onProgress(M)}m.enqueue(x),y()}},w=>{m.error(w)})}}});return new Response(g)}else throw new kd(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o==="")return c.text();{let d=/charset="?([^;"\s]*)"?/i.exec(o),u=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(u);return c.arrayBuffer().then(p=>f.decode(p))}}}).then(c=>{Ki.add(`file:${t}`,c);let h=Cn[t];delete Cn[t];for(let d=0,u=h.length;d<u;d++){let f=h[d];f.onLoad&&f.onLoad(c)}}).catch(c=>{let h=Cn[t];if(h===void 0)throw this.manager.itemError(t),c;delete Cn[t];for(let d=0,u=h.length;d<u;d++){let f=h[d];f.onError&&f.onError(c)}this.manager.itemError(t)}).finally(()=>{this.manager.itemEnd(t)}),this.manager.itemStart(t)}setResponseType(t){return this.responseType=t,this}setMimeType(t){return this.mimeType=t,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},Th=class extends je{constructor(t){super(t)}load(t,e,i,n){let r=this,a=new Vi(this.manager);a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(t,function(o){try{e(r.parse(JSON.parse(o)))}catch(l){n?n(l):Dt(l),r.manager.itemError(t)}},i,n)}parse(t){let e=[];for(let i=0;i<t.length;i++){let n=os.parse(t[i]);e.push(n)}return e}},Eh=class extends je{constructor(t){super(t)}load(t,e,i,n){let r=this,a=[],o=new ks,l=new Vi(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(r.withCredentials);let c=0;function h(d){l.load(t[d],function(u){let f=r.parse(u,!0);a[d]={width:f.width,height:f.height,format:f.format,mipmaps:f.mipmaps},c+=1,c===6&&(f.mipmapCount===1&&(o.minFilter=Se),o.image=a,o.format=f.format,o.needsUpdate=!0,e&&e(o))},i,n)}if(Array.isArray(t))for(let d=0,u=t.length;d<u;++d)h(d);else l.load(t,function(d){let u=r.parse(d,!0);if(u.isCubemap){let f=u.mipmaps.length/u.mipmapCount;for(let p=0;p<f;p++){a[p]={mipmaps:[]};for(let _=0;_<u.mipmapCount;_++)a[p].mipmaps.push(u.mipmaps[p*u.mipmapCount+_]),a[p].format=u.format,a[p].width=u.width,a[p].height=u.height}o.image=a}else o.image.width=u.width,o.image.height=u.height,o.mipmaps=u.mipmaps;u.mipmapCount===1&&(o.minFilter=Se),o.format=u.format,o.needsUpdate=!0,e&&e(o)},i,n);return o}},Cr=new WeakMap,ls=class extends je{constructor(t){super(t)}load(t,e,i,n){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let r=this,a=Ki.get(`image:${t}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(t),setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0);else{let d=Cr.get(a);d===void 0&&(d=[],Cr.set(a,d)),d.push({onLoad:e,onError:n})}return a}let o=Vr("img");function l(){h(),e&&e(this);let d=Cr.get(this)||[];for(let u=0;u<d.length;u++){let f=d[u];f.onLoad&&f.onLoad(this)}Cr.delete(this),r.manager.itemEnd(t)}function c(d){h(),n&&n(d),Ki.remove(`image:${t}`);let u=Cr.get(this)||[];for(let f=0;f<u.length;f++){let p=u[f];p.onError&&p.onError(d)}Cr.delete(this),r.manager.itemError(t),r.manager.itemEnd(t)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Ki.add(`image:${t}`,o),r.manager.itemStart(t),o.src=t,o}},Ah=class extends je{constructor(t){super(t)}load(t,e,i,n){let r=new ns;r.colorSpace=Be;let a=new ls(this.manager);a.setCrossOrigin(this.crossOrigin),a.setPath(this.path);let o=0;function l(c){a.load(t[c],function(h){r.images[c]=h,o++,o===6&&(r.needsUpdate=!0,e&&e(r))},void 0,n)}for(let c=0;c<t.length;++c)l(c);return r}},Ch=class extends je{constructor(t){super(t)}load(t,e,i,n){let r=this,a=new ui,o=new Vi(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(r.withCredentials),o.load(t,function(l){let c;try{c=r.parse(l)}catch(h){n!==void 0?n(h):Dt(h);return}r._applyTexData(a,c),e&&e(a,c)},i,n),a}createDataTexture(t){let e=new ui;return this._applyTexData(e,this.parse(t)),e}_applyTexData(t,e){e.image!==void 0?t.image=e.image:e.data!==void 0&&(t.image.width=e.width,t.image.height=e.height,t.image.data=e.data),t.wrapS=e.wrapS!==void 0?e.wrapS:hi,t.wrapT=e.wrapT!==void 0?e.wrapT:hi,t.magFilter=e.magFilter!==void 0?e.magFilter:Se,t.minFilter=e.minFilter!==void 0?e.minFilter:Se,t.anisotropy=e.anisotropy!==void 0?e.anisotropy:1,e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.mipmaps!==void 0&&(t.mipmaps=e.mipmaps,t.minFilter=rn),e.mipmapCount===1&&(t.minFilter=Se),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),t.needsUpdate=!0}},Rh=class extends je{constructor(t){super(t)}load(t,e,i,n){let r=new Le,a=new ls(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(o){r.image=o,r.needsUpdate=!0,e!==void 0&&e(r)},i,n),r}},nn=class extends re{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new at(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Ys=class extends nn{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(re.DEFAULT_UP),this.updateMatrix(),this.groundColor=new at(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Ad=new Ht,dm=new C,fm=new C,Zs=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new q(512,512),this.mapType=pi,this.map=null,this.mapPass=null,this.matrix=new Ht,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new dn,this._frameExtents=new q(1,1),this._viewportCount=1,this._viewports=[new ge(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;dm.setFromMatrixPosition(t.matrixWorld),e.position.copy(dm),fm.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(fm),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){Ad.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Ad,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=n?n.z/r.x:1,o=n?n.w/r.y:1,l=n?n.x/r.x:0,c=n?n.y/r.y:0;t.coordinateSystem===jn||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Ad)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},$c=new C,Jc=new Te,hn=new C,$s=class extends re{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ht,this.projectionMatrix=new Ht,this.projectionMatrixInverse=new Ht,this.coordinateSystem=xi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose($c,Jc,hn),hn.x===1&&hn.y===1&&hn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose($c,Jc,hn.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose($c,Jc,hn),hn.x===1&&hn.y===1&&hn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose($c,Jc,hn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Zn=new C,pm=new q,mm=new q,ze=class extends $s{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Is*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Rs*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Is*2*Math.atan(Math.tan(Rs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Zn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Zn.x,Zn.y).multiplyScalar(-t/Zn.z),Zn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Zn.x,Zn.y).multiplyScalar(-t/Zn.z)}getViewSize(t,e){return this.getViewBounds(t,pm,mm),e.subVectors(mm,pm)}setViewOffset(t,e,i,n,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Rs*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,r=-.5*n,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*n/l,e-=a.offsetY*i/c,n*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Vd=class extends Zs{constructor(){super(new ze(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,i=Is*2*t.angle*this.focus,n=this.mapSize.width/this.mapSize.height*this.aspect,r=t.distance||e.far;(i!==e.fov||n!==e.aspect||r!==e.far)&&(e.fov=i,e.aspect=n,e.far=r,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}},il=class extends nn{constructor(t,e,i=0,n=Math.PI/3,r=0,a=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(re.DEFAULT_UP),this.updateMatrix(),this.target=new re,this.distance=i,this.angle=n,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Vd}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture&&(e.object.map=this.map.toJSON(t).uuid),e.object.shadow=this.shadow.toJSON(),e}},Gd=class extends Zs{constructor(){super(new ze(90,1,.5,500)),this.isPointLightShadow=!0}},Js=class extends nn{constructor(t,e,i=0,n=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new Gd}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},Gi=class extends $s{constructor(t=-1,e=1,i=1,n=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,r=i-t,a=i+t,o=n+e,l=n-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Hd=class extends Zs{constructor(){super(new Gi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},_n=class extends nn{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(re.DEFAULT_UP),this.updateMatrix(),this.target=new re,this.shadow=new Hd}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}},Ks=class extends nn{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}},nl=class extends nn{constructor(t,e,i=10,n=10){super(t,e),this.isRectAreaLight=!0,this.type="RectAreaLight",this.width=i,this.height=n}get power(){return this.intensity*this.width*this.height*Math.PI}set power(t){this.intensity=t/(this.width*this.height*Math.PI)}copy(t){return super.copy(t),this.width=t.width,this.height=t.height,this}toJSON(t){let e=super.toJSON(t);return e.object.width=this.width,e.object.height=this.height,e}},la=class{constructor(){this.isSphericalHarmonics3=!0,this.coefficients=[];for(let t=0;t<9;t++)this.coefficients.push(new C)}set(t){for(let e=0;e<9;e++)this.coefficients[e].copy(t[e]);return this}zero(){for(let t=0;t<9;t++)this.coefficients[t].set(0,0,0);return this}getAt(t,e){let i=t.x,n=t.y,r=t.z,a=this.coefficients;return e.copy(a[0]).multiplyScalar(.282095),e.addScaledVector(a[1],.488603*n),e.addScaledVector(a[2],.488603*r),e.addScaledVector(a[3],.488603*i),e.addScaledVector(a[4],1.092548*(i*n)),e.addScaledVector(a[5],1.092548*(n*r)),e.addScaledVector(a[6],.315392*(3*r*r-1)),e.addScaledVector(a[7],1.092548*(i*r)),e.addScaledVector(a[8],.546274*(i*i-n*n)),e}getIrradianceAt(t,e){let i=t.x,n=t.y,r=t.z,a=this.coefficients;return e.copy(a[0]).multiplyScalar(.886227),e.addScaledVector(a[1],2*.511664*n),e.addScaledVector(a[2],2*.511664*r),e.addScaledVector(a[3],2*.511664*i),e.addScaledVector(a[4],2*.429043*i*n),e.addScaledVector(a[5],2*.429043*n*r),e.addScaledVector(a[6],.743125*r*r-.247708),e.addScaledVector(a[7],2*.429043*i*r),e.addScaledVector(a[8],.429043*(i*i-n*n)),e}add(t){for(let e=0;e<9;e++)this.coefficients[e].add(t.coefficients[e]);return this}addScaledSH(t,e){for(let i=0;i<9;i++)this.coefficients[i].addScaledVector(t.coefficients[i],e);return this}scale(t){for(let e=0;e<9;e++)this.coefficients[e].multiplyScalar(t);return this}lerp(t,e){for(let i=0;i<9;i++)this.coefficients[i].lerp(t.coefficients[i],e);return this}equals(t){for(let e=0;e<9;e++)if(!this.coefficients[e].equals(t.coefficients[e]))return!1;return!0}copy(t){return this.set(t.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(t,e=0){let i=this.coefficients;for(let n=0;n<9;n++)i[n].fromArray(t,e+n*3);return this}toArray(t=[],e=0){let i=this.coefficients;for(let n=0;n<9;n++)i[n].toArray(t,e+n*3);return t}static getBasisAt(t,e){let i=t.x,n=t.y,r=t.z;e[0]=.282095,e[1]=.488603*n,e[2]=.488603*r,e[3]=.488603*i,e[4]=1.092548*i*n,e[5]=1.092548*n*r,e[6]=.315392*(3*r*r-1),e[7]=1.092548*i*r,e[8]=.546274*(i*i-n*n)}},sl=class extends nn{constructor(t=new la,e=1){super(void 0,e),this.isLightProbe=!0,this.sh=t}copy(t){return super.copy(t),this.sh.copy(t.sh),this}toJSON(t){let e=super.toJSON(t);return e.object.sh=this.sh.toArray(),e}},gm={},rl=class s extends je{constructor(t){super(t),this.textures={}}load(t,e,i,n){let r=this,a=new Vi(r.manager);a.setPath(r.path),a.setRequestHeader(r.requestHeader),a.setWithCredentials(r.withCredentials),a.load(t,function(o){try{e(r.parse(JSON.parse(o)))}catch(l){n?n(l):Dt(l),r.manager.itemError(t)}},i,n)}parse(t){let e=this.createMaterialFromType(t.type);return e.fromJSON(t,this.textures),e}setTextures(t){return this.textures=t,this}createMaterialFromType(t){return s.createMaterialFromType(t)}static createMaterialFromType(t){let i={ShadowMaterial:Wo,SpriteMaterial:es,RawShaderMaterial:as,ShaderMaterial:Ce,PointsMaterial:is,MeshPhysicalMaterial:Xo,MeshStandardMaterial:Ge,MeshPhongMaterial:qo,MeshToonMaterial:Yo,MeshNormalMaterial:Zo,MeshLambertMaterial:$o,MeshDepthMaterial:ia,MeshDistanceMaterial:na,MeshBasicMaterial:ce,MeshMatcapMaterial:Jo,LineDashedMaterial:Ko,LineBasicMaterial:Ze,Material:Ve,...gm}[t],n;return i===void 0?(un(`MaterialLoader: Unknown material type "${t}". Use .registerMaterial() before starting the deserialization process.`),n=new Ve):n=new i,n}static registerMaterial(t,e){gm[t]=e}},ca=class{static extractUrlBase(t){let e=t.lastIndexOf("/");return e===-1?"./":t.slice(0,e+1)}static resolveURL(t,e){return typeof t!="string"||t===""?"":(/^https?:\/\//i.test(e)&&/^\//.test(t)&&(e=e.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(t)||/^data:.*,.*$/i.test(t)||/^blob:.*$/i.test(t)?t:e+t)}},al=class extends kt{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}},ol=class extends je{constructor(t){super(t)}load(t,e,i,n){let r=this,a=new Vi(r.manager);a.setPath(r.path),a.setRequestHeader(r.requestHeader),a.setWithCredentials(r.withCredentials),a.load(t,function(o){try{e(r.parse(JSON.parse(o)))}catch(l){n?n(l):Dt(l),r.manager.itemError(t)}},i,n)}parse(t){let e={},i={};function n(f,p){if(e[p]!==void 0)return e[p];let g=f.interleavedBuffers[p],m=r(f,g.buffer),y=Dr(g.type,m),w=new Os(y,g.stride);return w.uuid=g.uuid,g.usage!==void 0&&w.setUsage(g.usage),e[p]=w,w}function r(f,p){if(i[p]!==void 0)return i[p];let g=f.arrayBuffers[p],m=new Uint32Array(g).buffer;return i[p]=m,m}let a=t.isInstancedBufferGeometry?new al:new kt,o=t.data.index;if(o!==void 0){let f=Dr(o.type,o.array);a.setIndex(new he(f,1))}let l=t.data.attributes;for(let f in l){let p=l[f],_;if(p.isInterleavedBufferAttribute){let g=n(t.data,p.data);_=new ts(g,p.itemSize,p.offset,p.normalized)}else{let g=Dr(p.type,p.array),m=p.isInstancedBufferAttribute?In:he;_=new m(g,p.itemSize,p.normalized)}p.name!==void 0&&(_.name=p.name),p.usage!==void 0&&_.setUsage(p.usage),p.gpuType!==void 0&&(_.gpuType=p.gpuType),a.setAttribute(f,_)}let c=t.data.morphAttributes;if(c)for(let f in c){let p=c[f],_=[];for(let g=0,m=p.length;g<m;g++){let y=p[g],w;if(y.isInterleavedBufferAttribute){let x=n(t.data,y.data);w=new ts(x,y.itemSize,y.offset,y.normalized)}else{let x=Dr(y.type,y.array);w=new he(x,y.itemSize,y.normalized)}y.name!==void 0&&(w.name=y.name),y.usage!==void 0&&w.setUsage(y.usage),y.gpuType!==void 0&&(w.gpuType=y.gpuType),_.push(w)}a.morphAttributes[f]=_}t.data.morphTargetsRelative&&(a.morphTargetsRelative=!0);let d=t.data.groups||t.data.drawcalls||t.data.offsets;if(d!==void 0)for(let f=0,p=d.length;f!==p;++f){let _=d[f];a.addGroup(_.start,_.count,_.materialIndex)}let u=t.data.boundingSphere;return u!==void 0&&(a.boundingSphere=new ke().fromJSON(u)),t.name&&(a.name=t.name),t.userData&&(a.userData=t.userData),a}},Cd={},Ph=class extends je{constructor(t){super(t)}load(t,e,i,n){let r=this,a=this.path===""?ca.extractUrlBase(t):this.path;this.resourcePath=this.resourcePath||a;let o=new Vi(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(t,function(l){let c=null;try{c=JSON.parse(l)}catch(d){n!==void 0&&n(d),Dt("ObjectLoader: Can't parse "+t+".",d.message);return}let h=c.metadata;if(h===void 0||h.type===void 0||h.type.toLowerCase()==="geometry"){n!==void 0&&n(new Error("THREE.ObjectLoader: Can't load "+t)),Dt("ObjectLoader: Can't load "+t);return}r.parse(c,e)},i,n)}async loadAsync(t,e){let i=this,n=this.path===""?ca.extractUrlBase(t):this.path;this.resourcePath=this.resourcePath||n;let r=new Vi(this.manager);r.setPath(this.path),r.setRequestHeader(this.requestHeader),r.setWithCredentials(this.withCredentials);let a=await r.loadAsync(t,e),o;try{o=JSON.parse(a)}catch(c){throw new Error("THREE.ObjectLoader: Can't parse "+t+". "+c.message)}let l=o.metadata;if(l===void 0||l.type===void 0||l.type.toLowerCase()==="geometry")throw new Error("THREE.ObjectLoader: Can't load "+t);return await i.parseAsync(o)}parse(t,e){let i=this.parseAnimations(t.animations),n=this.parseShapes(t.shapes),r=this.parseGeometries(t.geometries,n),a=this.parseImages(t.images,function(){e!==void 0&&e(c)}),o=this.parseTextures(t.textures,a),l=this.parseMaterials(t.materials,o),c=this.parseObject(t.object,r,l,o,i),h=this.parseSkeletons(t.skeletons,c);if(this.bindSkeletons(c,h),this.bindLightTargets(c),e!==void 0){let d=!1;for(let u in a)if(a[u].data instanceof HTMLImageElement){d=!0;break}d===!1&&e(c)}return c}async parseAsync(t){let e=this.parseAnimations(t.animations),i=this.parseShapes(t.shapes),n=this.parseGeometries(t.geometries,i),r=await this.parseImagesAsync(t.images),a=this.parseTextures(t.textures,r),o=this.parseMaterials(t.materials,a),l=this.parseObject(t.object,n,o,a,e),c=this.parseSkeletons(t.skeletons,l);return this.bindSkeletons(l,c),this.bindLightTargets(l),l}static registerGeometry(t,e){Cd[t]=e}parseShapes(t){let e={};if(t!==void 0)for(let i=0,n=t.length;i<n;i++){let r=new zi().fromJSON(t[i]);e[r.uuid]=r}return e}parseSkeletons(t,e){let i={},n={};if(e.traverse(function(r){r.isBone&&(n[r.uuid]=r)}),t!==void 0)for(let r=0,a=t.length;r<a;r++){let o=new Mo().fromJSON(t[r],n);i[o.uuid]=o}return i}parseGeometries(t,e){let i={};if(t!==void 0){let n=new ol;for(let r=0,a=t.length;r<a;r++){let o,l=t[r];switch(l.type){case"BufferGeometry":case"InstancedBufferGeometry":o=n.parse(l);break;default:l.type in lm?o=lm[l.type].fromJSON(l,e):l.type in Cd?o=Cd[l.type].fromJSON(l,e):pt(`ObjectLoader: Unknown geometry type "${l.type}". Use .registerGeometry() before starting the deserialization process.`)}o.uuid=l.uuid,l.name!==void 0&&(o.name=l.name),l.userData!==void 0&&(o.userData=l.userData),i[l.uuid]=o}}return i}parseMaterials(t,e){let i={},n={};if(t!==void 0){let r=new rl;r.setTextures(e);for(let a=0,o=t.length;a<o;a++){let l=t[a];i[l.uuid]===void 0&&(i[l.uuid]=r.parse(l)),n[l.uuid]=i[l.uuid]}}return n}parseAnimations(t){let e={};if(t!==void 0)for(let i=0;i<t.length;i++){let n=t[i],r=os.parse(n);e[r.uuid]=r}return e}parseImages(t,e){let i=this,n={},r;function a(l){return l=i.manager.resolveURL(l),i.manager.itemStart(l),r.load(l,function(){i.manager.itemEnd(l)},void 0,function(){i.manager.itemError(l),i.manager.itemEnd(l)})}function o(l){if(typeof l=="string"){let c=l,h=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(c)?c:i.resourcePath+c;return a(h)}else return l.data?{data:Dr(l.type,l.data),width:l.width,height:l.height}:null}if(t!==void 0&&t.length>0){let l=new oa(e);r=new ls(l),r.setCrossOrigin(this.crossOrigin);for(let c=0,h=t.length;c<h;c++){let d=t[c],u=d.url;if(Array.isArray(u)){let f=[];for(let p=0,_=u.length;p<_;p++){let g=u[p],m=o(g);m!==null&&(m instanceof HTMLImageElement?f.push(m):f.push(new ui(m.data,m.width,m.height)))}n[d.uuid]=new Ui(f)}else{let f=o(d.url);n[d.uuid]=new Ui(f)}}}return n}async parseImagesAsync(t){let e=this,i={},n;async function r(a){if(typeof a=="string"){let o=a,l=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(o)?o:e.resourcePath+o;return await n.loadAsync(l)}else return a.data?{data:Dr(a.type,a.data),width:a.width,height:a.height}:null}if(t!==void 0&&t.length>0){n=new ls(this.manager),n.setCrossOrigin(this.crossOrigin);for(let a=0,o=t.length;a<o;a++){let l=t[a],c=l.url;if(Array.isArray(c)){let h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d],p=await r(f);p!==null&&(p instanceof HTMLImageElement?h.push(p):h.push(new ui(p.data,p.width,p.height)))}i[l.uuid]=new Ui(h)}else{let h=await r(l.url);i[l.uuid]=new Ui(h)}}}return i}parseTextures(t,e){function i(r,a){return typeof r=="number"?r:(pt("ObjectLoader.parseTexture: Constant should be in numeric form.",r),a[r])}let n={};if(t!==void 0)for(let r=0,a=t.length;r<a;r++){let o=t[r];o.image===void 0&&pt('ObjectLoader: No "image" specified for',o.uuid),e[o.image]===void 0&&pt("ObjectLoader: Undefined image",o.image);let l=e[o.image],c=l.data,h;Array.isArray(c)?(h=new ns,c.length===6&&(h.needsUpdate=!0)):(c&&c.data?h=new ui:h=new Le,c&&(h.needsUpdate=!0)),h.source=l,h.uuid=o.uuid,o.name!==void 0&&(h.name=o.name),o.mapping!==void 0&&(h.mapping=i(o.mapping,Mx)),o.channel!==void 0&&(h.channel=o.channel),o.offset!==void 0&&h.offset.fromArray(o.offset),o.repeat!==void 0&&h.repeat.fromArray(o.repeat),o.center!==void 0&&h.center.fromArray(o.center),o.rotation!==void 0&&(h.rotation=o.rotation),o.wrap!==void 0&&(h.wrapS=i(o.wrap[0],_m),h.wrapT=i(o.wrap[1],_m)),o.format!==void 0&&(h.format=o.format),o.internalFormat!==void 0&&(h.internalFormat=o.internalFormat),o.type!==void 0&&(h.type=o.type),o.colorSpace!==void 0&&(h.colorSpace=o.colorSpace),o.minFilter!==void 0&&(h.minFilter=i(o.minFilter,xm)),o.magFilter!==void 0&&(h.magFilter=i(o.magFilter,xm)),o.anisotropy!==void 0&&(h.anisotropy=o.anisotropy),o.flipY!==void 0&&(h.flipY=o.flipY),o.generateMipmaps!==void 0&&(h.generateMipmaps=o.generateMipmaps),o.premultiplyAlpha!==void 0&&(h.premultiplyAlpha=o.premultiplyAlpha),o.unpackAlignment!==void 0&&(h.unpackAlignment=o.unpackAlignment),o.compareFunction!==void 0&&(h.compareFunction=o.compareFunction),o.normalized!==void 0&&(h.normalized=o.normalized),o.userData!==void 0&&(h.userData=o.userData),n[o.uuid]=h}return n}parseObject(t,e,i,n,r){let a;function o(u){return e[u]===void 0&&pt("ObjectLoader: Undefined geometry",u),e[u]}function l(u){if(u!==void 0){if(Array.isArray(u)){let f=[];for(let p=0,_=u.length;p<_;p++){let g=u[p];i[g]===void 0&&pt("ObjectLoader: Undefined material",g),f.push(i[g])}return f}return i[u]===void 0&&pt("ObjectLoader: Undefined material",u),i[u]}}function c(u){return n[u]===void 0&&pt("ObjectLoader: Undefined texture",u),n[u]}let h,d;switch(t.type){case"Scene":a=new Fs,t.background!==void 0&&(Number.isInteger(t.background)?a.background=new at(t.background):a.background=c(t.background)),t.environment!==void 0&&(a.environment=c(t.environment)),t.fog!==void 0&&(t.fog.type==="Fog"?a.fog=new xo(t.fog.color,t.fog.near,t.fog.far):t.fog.type==="FogExp2"&&(a.fog=new _o(t.fog.color,t.fog.density)),t.fog.name!==""&&(a.fog.name=t.fog.name)),t.backgroundBlurriness!==void 0&&(a.backgroundBlurriness=t.backgroundBlurriness),t.backgroundIntensity!==void 0&&(a.backgroundIntensity=t.backgroundIntensity),t.backgroundRotation!==void 0&&a.backgroundRotation.fromArray(t.backgroundRotation),t.environmentIntensity!==void 0&&(a.environmentIntensity=t.environmentIntensity),t.environmentRotation!==void 0&&a.environmentRotation.fromArray(t.environmentRotation);break;case"PerspectiveCamera":a=new ze(t.fov,t.aspect,t.near,t.far),t.focus!==void 0&&(a.focus=t.focus),t.zoom!==void 0&&(a.zoom=t.zoom),t.filmGauge!==void 0&&(a.filmGauge=t.filmGauge),t.filmOffset!==void 0&&(a.filmOffset=t.filmOffset),t.view!==void 0&&(a.view=Object.assign({},t.view));break;case"OrthographicCamera":a=new Gi(t.left,t.right,t.top,t.bottom,t.near,t.far),t.zoom!==void 0&&(a.zoom=t.zoom),t.view!==void 0&&(a.view=Object.assign({},t.view));break;case"AmbientLight":a=new Ks(t.color,t.intensity);break;case"DirectionalLight":a=new _n(t.color,t.intensity),a.target=t.target||"";break;case"PointLight":a=new Js(t.color,t.intensity,t.distance,t.decay);break;case"RectAreaLight":a=new nl(t.color,t.intensity,t.width,t.height);break;case"SpotLight":a=new il(t.color,t.intensity,t.distance,t.angle,t.penumbra,t.decay),a.target=t.target||"";break;case"HemisphereLight":a=new Ys(t.color,t.groundColor,t.intensity);break;case"LightProbe":let u=new la().fromArray(t.sh);a=new sl(u,t.intensity);break;case"SkinnedMesh":h=o(t.geometry),d=l(t.material),a=new yo(h,d),t.bindMode!==void 0&&(a.bindMode=t.bindMode),t.bindMatrix!==void 0&&a.bindMatrix.fromArray(t.bindMatrix),t.skeleton!==void 0&&(a.skeleton=t.skeleton);break;case"Mesh":h=o(t.geometry),d=l(t.material),a=new ee(h,d);break;case"InstancedMesh":h=o(t.geometry),d=l(t.material);let f=t.count,p=t.instanceMatrix,_=t.instanceColor;a=new De(h,d,f),a.instanceMatrix=new In(new Float32Array(p.array),16),_!==void 0&&(a.instanceColor=new In(new Float32Array(_.array),_.itemSize));break;case"BatchedMesh":h=o(t.geometry),d=l(t.material),a=new So(t.maxInstanceCount,t.maxVertexCount,t.maxIndexCount,d),a.geometry=h,a.perObjectFrustumCulled=t.perObjectFrustumCulled,a.sortObjects=t.sortObjects,a._drawRanges=t.drawRanges,a._reservedRanges=t.reservedRanges,a._geometryInfo=t.geometryInfo.map(g=>{let m=null,y=null;return g.boundingBox!==void 0&&(m=new He().fromJSON(g.boundingBox)),g.boundingSphere!==void 0&&(y=new ke().fromJSON(g.boundingSphere)),{...g,boundingBox:m,boundingSphere:y}}),a._instanceInfo=t.instanceInfo,a._availableInstanceIds=t._availableInstanceIds,a._availableGeometryIds=t._availableGeometryIds,a._nextIndexStart=t.nextIndexStart,a._nextVertexStart=t.nextVertexStart,a._geometryCount=t.geometryCount,a._maxInstanceCount=t.maxInstanceCount,a._maxVertexCount=t.maxVertexCount,a._maxIndexCount=t.maxIndexCount,a._geometryInitialized=t.geometryInitialized,a._matricesTexture=c(t.matricesTexture.uuid),a._indirectTexture=c(t.indirectTexture.uuid),t.colorsTexture!==void 0&&(a._colorsTexture=c(t.colorsTexture.uuid)),t.boundingSphere!==void 0&&(a.boundingSphere=new ke().fromJSON(t.boundingSphere)),t.boundingBox!==void 0&&(a.boundingBox=new He().fromJSON(t.boundingBox));break;case"LOD":a=new vo;break;case"Line":a=new tn(o(t.geometry),l(t.material));break;case"LineLoop":a=new wo(o(t.geometry),l(t.material));break;case"LineSegments":a=new Ai(o(t.geometry),l(t.material));break;case"PointCloud":case"Points":a=new zs(o(t.geometry),l(t.material));break;case"Sprite":a=new Bs(l(t.material));break;case"Group":a=new Ti;break;case"Bone":a=new qr;break;default:a=new re}if(a.uuid=t.uuid,t.name!==void 0&&(a.name=t.name),t.matrix!==void 0?(a.matrix.fromArray(t.matrix),t.matrixAutoUpdate!==void 0&&(a.matrixAutoUpdate=t.matrixAutoUpdate),a.matrixAutoUpdate&&a.matrix.decompose(a.position,a.quaternion,a.scale)):(t.position!==void 0&&a.position.fromArray(t.position),t.rotation!==void 0&&a.rotation.fromArray(t.rotation),t.quaternion!==void 0&&a.quaternion.fromArray(t.quaternion),t.scale!==void 0&&a.scale.fromArray(t.scale)),t.up!==void 0&&a.up.fromArray(t.up),t.pivot!==void 0&&(a.pivot=new C().fromArray(t.pivot)),t.morphTargetDictionary!==void 0&&(a.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),t.morphTargetInfluences!==void 0&&(a.morphTargetInfluences=t.morphTargetInfluences.slice()),t.castShadow!==void 0&&(a.castShadow=t.castShadow),t.receiveShadow!==void 0&&(a.receiveShadow=t.receiveShadow),t.shadow&&(t.shadow.intensity!==void 0&&(a.shadow.intensity=t.shadow.intensity),t.shadow.bias!==void 0&&(a.shadow.bias=t.shadow.bias),t.shadow.normalBias!==void 0&&(a.shadow.normalBias=t.shadow.normalBias),t.shadow.radius!==void 0&&(a.shadow.radius=t.shadow.radius),t.shadow.blurSamples!==void 0&&(a.shadow.blurSamples=t.shadow.blurSamples),t.shadow.focus!==void 0&&(a.shadow.focus=t.shadow.focus),t.shadow.aspect!==void 0&&(a.shadow.aspect=t.shadow.aspect),t.shadow.mapSize!==void 0&&a.shadow.mapSize.fromArray(t.shadow.mapSize),t.shadow.camera!==void 0&&(a.shadow.camera=this.parseObject(t.shadow.camera))),t.visible!==void 0&&(a.visible=t.visible),t.frustumCulled!==void 0&&(a.frustumCulled=t.frustumCulled),t.renderOrder!==void 0&&(a.renderOrder=t.renderOrder),t.static!==void 0&&(a.static=t.static),t.userData!==void 0&&(a.userData=t.userData),t.layers!==void 0&&(a.layers.mask=t.layers),t.children!==void 0){let u=t.children;for(let f=0;f<u.length;f++)a.add(this.parseObject(u[f],e,i,n,r))}if(t.animations!==void 0){let u=t.animations;for(let f=0;f<u.length;f++){let p=u[f];a.animations.push(r[p])}}if(t.type==="LOD"){t.autoUpdate!==void 0&&(a.autoUpdate=t.autoUpdate);let u=t.levels;for(let f=0;f<u.length;f++){let p=u[f],_=a.getObjectByProperty("uuid",p.object);_!==void 0&&a.addLevel(_,p.distance,p.hysteresis)}}return a}bindSkeletons(t,e){Object.keys(e).length!==0&&t.traverse(function(i){if(i.isSkinnedMesh===!0&&i.skeleton!==void 0){let n=e[i.skeleton];n===void 0?pt("ObjectLoader: No skeleton found with UUID:",i.skeleton):i.bind(n,i.bindMatrix)}})}bindLightTargets(t){t.traverse(function(e){if(e.isDirectionalLight||e.isSpotLight){let i=e.target,n=t.getObjectByProperty("uuid",i);n!==void 0?e.target=n:e.target=new re}})}},Mx={UVMapping:pl,CubeReflectionMapping:sn,CubeRefractionMapping:On,EquirectangularReflectionMapping:Ma,EquirectangularRefractionMapping:ba,CubeUVReflectionMapping:ir},_m={RepeatWrapping:Ur,ClampToEdgeWrapping:hi,MirroredRepeatWrapping:Fr},xm={NearestFilter:Ie,NearestMipmapNearestFilter:pu,NearestMipmapLinearFilter:nr,LinearFilter:Se,LinearMipmapNearestFilter:Sa,LinearMipmapLinearFilter:rn},Rd=new WeakMap,Ih=class extends je{constructor(t){super(t),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&pt("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&pt("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(t){return this.options=t,this}load(t,e,i,n){t===void 0&&(t=""),this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let r=this,a=Ki.get(`image-bitmap:${t}`);if(a!==void 0){if(r.manager.itemStart(t),a.then){a.then(c=>{Rd.has(a)===!0?(n&&n(Rd.get(a)),r.manager.itemError(t),r.manager.itemEnd(t)):(e&&e(c),r.manager.itemEnd(t))});return}setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0);return}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(t,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return Ki.add(`image-bitmap:${t}`,c),e&&e(c),r.manager.itemEnd(t),c}).catch(function(c){n&&n(c),Rd.set(l,c),Ki.remove(`image-bitmap:${t}`),r.manager.itemError(t),r.manager.itemEnd(t)});Ki.add(`image-bitmap:${t}`,l),r.manager.itemStart(t)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},Kc,ha=class{static getContext(){return Kc===void 0&&(Kc=new(window.AudioContext||window.webkitAudioContext)),Kc}static setContext(t){Kc=t}},Lh=class extends je{constructor(t){super(t)}load(t,e,i,n){let r=this,a=new Vi(this.manager);a.setResponseType("arraybuffer"),a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(t,function(l){try{let c=l.slice(0),h=ha.getContext(),d=t+"#decode";r.manager.itemStart(d),h.decodeAudioData(c,function(u){e(u),r.manager.itemEnd(d)}).catch(function(u){o(u),r.manager.itemEnd(d)})}catch(c){o(c)}},i,n);function o(l){n?n(l):Dt(l),r.manager.itemError(t)}}},vm=new Ht,ym=new Ht,Ss=new Ht,Dh=class{constructor(){this.type="StereoCamera",this.aspect=1,this.eyeSep=.064,this.cameraL=new ze,this.cameraL.layers.enable(1),this.cameraL.matrixAutoUpdate=!1,this.cameraR=new ze,this.cameraR.layers.enable(2),this.cameraR.matrixAutoUpdate=!1,this._cache={focus:null,fov:null,aspect:null,near:null,far:null,zoom:null,eyeSep:null}}update(t){let e=this._cache;if(e.focus!==t.focus||e.fov!==t.fov||e.aspect!==t.aspect*this.aspect||e.near!==t.near||e.far!==t.far||e.zoom!==t.zoom||e.eyeSep!==this.eyeSep){e.focus=t.focus,e.fov=t.fov,e.aspect=t.aspect*this.aspect,e.near=t.near,e.far=t.far,e.zoom=t.zoom,e.eyeSep=this.eyeSep,Ss.copy(t.projectionMatrix);let n=e.eyeSep/2,r=n*e.near/e.focus,a=e.near*Math.tan(Rs*e.fov*.5)/e.zoom,o,l;ym.elements[12]=-n,vm.elements[12]=n,o=-a*e.aspect+r,l=a*e.aspect+r,Ss.elements[0]=2*e.near/(l-o),Ss.elements[8]=(l+o)/(l-o),this.cameraL.projectionMatrix.copy(Ss),o=-a*e.aspect-r,l=a*e.aspect-r,Ss.elements[0]=2*e.near/(l-o),Ss.elements[8]=(l+o)/(l-o),this.cameraR.projectionMatrix.copy(Ss)}this.cameraL.matrix.copy(t.matrixWorld).multiply(ym),this.cameraL.matrixWorldNeedsUpdate=!0,this.cameraR.matrix.copy(t.matrixWorld).multiply(vm),this.cameraR.matrixWorldNeedsUpdate=!0}},Rr=-90,Pr=1,ll=class extends re{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new ze(Rr,Pr,t,e);n.layers=this.layers,this.add(n);let r=new ze(Rr,Pr,t,e);r.layers=this.layers,this.add(r);let a=new ze(Rr,Pr,t,e);a.layers=this.layers,this.add(a);let o=new ze(Rr,Pr,t,e);o.layers=this.layers,this.add(o);let l=new ze(Rr,Pr,t,e);l.layers=this.layers,this.add(l);let c=new ze(Rr,Pr,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===xi)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===jn)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;t.isWebGLRenderer===!0?g=t.state.buffers.depth.getReversed():g=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,2,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,3,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=_,t.setRenderTarget(i,5,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,u,f),t.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},cl=class extends ze{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},js=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(t){this._document=t,t.hidden!==void 0&&(this._pageVisibilityHandler=bx.bind(this),t.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(t){return this._timescale=t,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(t){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(t!==void 0?t:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function bx(){this._document.hidden===!1&&this.reset()}var ws=new C,Pd=new Te,Sx=new C,Ts=new C,Es=new C,Nh=class extends re{constructor(){super(),this.type="AudioListener",this.context=ha.getContext(),this.gain=this.context.createGain(),this.gain.connect(this.context.destination),this.filter=null,this.timeDelta=0,this._timer=new js}getInput(){return this.gain}removeFilter(){return this.filter!==null&&(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination),this.gain.connect(this.context.destination),this.filter=null),this}getFilter(){return this.filter}setFilter(t){return this.filter!==null?(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination)):this.gain.disconnect(this.context.destination),this.filter=t,this.gain.connect(this.filter),this.filter.connect(this.context.destination),this}getMasterVolume(){return this.gain.gain.value}setMasterVolume(t){return this.gain.gain.setTargetAtTime(t,this.context.currentTime,.01),this}updateMatrixWorld(t){super.updateMatrixWorld(t),this._timer.update();let e=this.context.listener;if(this.timeDelta=this._timer.getDelta(),this.matrixWorld.decompose(ws,Pd,Sx),Ts.set(0,0,-1).applyQuaternion(Pd),Es.set(0,1,0).applyQuaternion(Pd),e.positionX){let i=this.context.currentTime+this.timeDelta;e.positionX.linearRampToValueAtTime(ws.x,i),e.positionY.linearRampToValueAtTime(ws.y,i),e.positionZ.linearRampToValueAtTime(ws.z,i),e.forwardX.linearRampToValueAtTime(Ts.x,i),e.forwardY.linearRampToValueAtTime(Ts.y,i),e.forwardZ.linearRampToValueAtTime(Ts.z,i),e.upX.linearRampToValueAtTime(Es.x,i),e.upY.linearRampToValueAtTime(Es.y,i),e.upZ.linearRampToValueAtTime(Es.z,i)}else e.setPosition(ws.x,ws.y,ws.z),e.setOrientation(Ts.x,Ts.y,Ts.z,Es.x,Es.y,Es.z)}},hl=class extends re{constructor(t){super(),this.type="Audio",this.listener=t,this.context=t.context,this.gain=this.context.createGain(),this.gain.connect(t.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(t){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=t,this.connect(),this}setMediaElementSource(t){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(t),this.connect(),this}setMediaStreamSource(t){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(t),this.connect(),this}setBuffer(t){return this.buffer=t,this.sourceType="buffer",this.autoplay&&this.play(),this}play(t=0){if(this.isPlaying===!0){pt("Audio: Audio is already playing.");return}if(this.hasPlaybackControl===!1){pt("Audio: this Audio has no playback control.");return}this._startedAt=this.context.currentTime+t;let e=this.context.createBufferSource();return e.buffer=this.buffer,e.loop=this.loop,e.loopStart=this.loopStart,e.loopEnd=this.loopEnd,e.onended=this.onEnded.bind(this),e.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=e,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){pt("Audio: this Audio has no playback control.");return}return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this}stop(t=0){if(this.hasPlaybackControl===!1){pt("Audio: this Audio has no playback control.");return}return this._progress=0,this.source!==null&&(this.source.stop(this.context.currentTime+t),this.source.onended=null),this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let t=1,e=this.filters.length;t<e;t++)this.filters[t-1].connect(this.filters[t]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this._connected!==!1){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let t=1,e=this.filters.length;t<e;t++)this.filters[t-1].disconnect(this.filters[t]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}}getFilters(){return this.filters}setFilters(t){return t||(t=[]),this._connected===!0?(this.disconnect(),this.filters=t.slice(),this.connect()):this.filters=t.slice(),this}setDetune(t){return this.detune=t,this.isPlaying===!0&&this.source.detune!==void 0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(t){return this.setFilters(t?[t]:[])}setPlaybackRate(t){if(this.hasPlaybackControl===!1){pt("Audio: this Audio has no playback control.");return}return this.playbackRate=t,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1,this._progress=0}getLoop(){return this.hasPlaybackControl===!1?(pt("Audio: this Audio has no playback control."),!1):this.loop}setLoop(t){if(this.hasPlaybackControl===!1){pt("Audio: this Audio has no playback control.");return}return this.loop=t,this.isPlaying===!0&&(this.source.loop=this.loop),this}setLoopStart(t){return this.loopStart=t,this}setLoopEnd(t){return this.loopEnd=t,this}getVolume(){return this.gain.gain.value}setVolume(t){return this.gain.gain.setTargetAtTime(t,this.context.currentTime,.01),this}copy(t,e){return super.copy(t,e),t.sourceType!=="buffer"?(pt("Audio: Audio source type cannot be copied."),this):(this.autoplay=t.autoplay,this.buffer=t.buffer,this.detune=t.detune,this.loop=t.loop,this.loopStart=t.loopStart,this.loopEnd=t.loopEnd,this.offset=t.offset,this.duration=t.duration,this.playbackRate=t.playbackRate,this.hasPlaybackControl=t.hasPlaybackControl,this.sourceType=t.sourceType,this.filters=t.filters.slice(),this)}clone(t){return new this.constructor(this.listener).copy(this,t)}},As=new C,Mm=new Te,wx=new C,Cs=new C,Uh=class extends hl{constructor(t){super(t),this.panner=this.context.createPanner(),this.panner.panningModel="HRTF",this.panner.connect(this.gain)}connect(){return super.connect(),this.panner.connect(this.gain),this}disconnect(){return super.disconnect(),this.panner.disconnect(this.gain),this}getOutput(){return this.panner}getRefDistance(){return this.panner.refDistance}setRefDistance(t){return this.panner.refDistance=t,this}getRolloffFactor(){return this.panner.rolloffFactor}setRolloffFactor(t){return this.panner.rolloffFactor=t,this}getDistanceModel(){return this.panner.distanceModel}setDistanceModel(t){return this.panner.distanceModel=t,this}getMaxDistance(){return this.panner.maxDistance}setMaxDistance(t){return this.panner.maxDistance=t,this}setDirectionalCone(t,e,i){return this.panner.coneInnerAngle=t,this.panner.coneOuterAngle=e,this.panner.coneOuterGain=i,this}updateMatrixWorld(t){if(super.updateMatrixWorld(t),this.hasPlaybackControl===!0&&this.isPlaying===!1)return;this.matrixWorld.decompose(As,Mm,wx),Cs.set(0,0,1).applyQuaternion(Mm);let e=this.panner;if(e.positionX){let i=this.context.currentTime+this.listener.timeDelta;e.positionX.linearRampToValueAtTime(As.x,i),e.positionY.linearRampToValueAtTime(As.y,i),e.positionZ.linearRampToValueAtTime(As.z,i),e.orientationX.linearRampToValueAtTime(Cs.x,i),e.orientationY.linearRampToValueAtTime(Cs.y,i),e.orientationZ.linearRampToValueAtTime(Cs.z,i)}else e.setPosition(As.x,As.y,As.z),e.setOrientation(Cs.x,Cs.y,Cs.z)}},Fh=class{constructor(t,e=2048){this.analyser=t.context.createAnalyser(),this.analyser.fftSize=e,this.data=new Uint8Array(this.analyser.frequencyBinCount),t.getOutput().connect(this.analyser)}getFrequencyData(){return this.analyser.getByteFrequencyData(this.data),this.data}getAverageFrequency(){let t=0,e=this.getFrequencyData();for(let i=0;i<e.length;i++)t+=e[i];return t/e.length}},ul=class{constructor(t,e,i){this.binding=t,this.valueSize=i;let n,r,a;switch(e){case"quaternion":n=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(i*6),this._workIndex=5;break;case"string":case"bool":n=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(i*5);break;default:n=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(i*5)}this._mixBufferRegion=n,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(t,e){let i=this.buffer,n=this.valueSize,r=t*n+n,a=this.cumulativeWeight;if(a===0){for(let o=0;o!==n;++o)i[r+o]=i[o];a=e}else{a+=e;let o=e/a;this._mixBufferRegion(i,r,0,o,n)}this.cumulativeWeight=a}accumulateAdditive(t){let e=this.buffer,i=this.valueSize,n=i*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(e,n,0,t,i),this.cumulativeWeightAdditive+=t}apply(t){let e=this.valueSize,i=this.buffer,n=t*e+e,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=e*this._origIndex;this._mixBufferRegion(i,n,l,1-r,e)}a>0&&this._mixBufferRegionAdditive(i,n,this._addIndex*e,1,e);for(let l=e,c=e+e;l!==c;++l)if(i[l]!==i[l+e]){o.setValue(i,n);break}}saveOriginalState(){let t=this.binding,e=this.buffer,i=this.valueSize,n=i*this._origIndex;t.getValue(e,n);for(let r=i,a=n;r!==a;++r)e[r]=e[n+r%i];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let t=this.valueSize*3;this.binding.setValue(this.buffer,t)}_setAdditiveIdentityNumeric(){let t=this._addIndex*this.valueSize,e=t+this.valueSize;for(let i=t;i<e;i++)this.buffer[i]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let t=this._origIndex*this.valueSize,e=this._addIndex*this.valueSize;for(let i=0;i<this.valueSize;i++)this.buffer[e+i]=this.buffer[t+i]}_select(t,e,i,n,r){if(n>=.5)for(let a=0;a!==r;++a)t[e+a]=t[i+a]}_slerp(t,e,i,n){Te.slerpFlat(t,e,t,e,t,i,n)}_slerpAdditive(t,e,i,n,r){let a=this._workIndex*r;Te.multiplyQuaternionsFlat(t,a,t,e,t,i),Te.slerpFlat(t,e,t,e,t,a,n)}_lerp(t,e,i,n,r){let a=1-n;for(let o=0;o!==r;++o){let l=e+o;t[l]=t[l]*a+t[i+o]*n}}_lerpAdditive(t,e,i,n,r){for(let a=0;a!==r;++a){let o=e+a;t[o]=t[o]+t[i+a]*n}}},Uf="\\[\\]\\.:\\/",Tx=new RegExp("["+Uf+"]","g"),Ff="[^"+Uf+"]",Ex="[^"+Uf.replace("\\.","")+"]",Ax=/((?:WC+[\/:])*)/.source.replace("WC",Ff),Cx=/(WCOD+)?/.source.replace("WCOD",Ex),Rx=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ff),Px=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ff),Ix=new RegExp("^"+Ax+Cx+Rx+Px+"$"),Lx=["material","materials","bones","map"],Wd=class{constructor(t,e,i){let n=i||me.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,r=i.length;n!==r;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},me=class s{constructor(t,e,i){this.path=e,this.parsedPath=i||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,i):new s(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Tx,"")}static parseTrackName(t){let e=Ix.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let r=i.nodeName.substring(n+1);Lx.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=i(o.children);if(l)return l}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){pt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){Dt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Dt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Dt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Dt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Dt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Dt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Dt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[n];if(a===void 0){let c=e.nodeName;Dt("PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){Dt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Dt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};me.Composite=Wd;me.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};me.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};me.prototype.GetterByBindingType=[me.prototype._getValue_direct,me.prototype._getValue_array,me.prototype._getValue_arrayElement,me.prototype._getValue_toArray];me.prototype.SetterByBindingTypeAndVersioning=[[me.prototype._setValue_direct,me.prototype._setValue_direct_setNeedsUpdate,me.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[me.prototype._setValue_array,me.prototype._setValue_array_setNeedsUpdate,me.prototype._setValue_array_setMatrixWorldNeedsUpdate],[me.prototype._setValue_arrayElement,me.prototype._setValue_arrayElement_setNeedsUpdate,me.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[me.prototype._setValue_fromArray,me.prototype._setValue_fromArray_setNeedsUpdate,me.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Oh=class{constructor(){this.isAnimationObjectGroup=!0,this.uuid=Ei(),this._objects=Array.prototype.slice.call(arguments),this.nCachedObjects_=0;let t={};this._indicesByUUID=t;for(let i=0,n=arguments.length;i!==n;++i)t[arguments[i].uuid]=i;this._paths=[],this._parsedPaths=[],this._bindings=[],this._bindingsIndicesByPath={};let e=this;this.stats={objects:{get total(){return e._objects.length},get inUse(){return this.total-e.nCachedObjects_}},get bindingsPerObject(){return e._bindings.length}}}add(){let t=this._objects,e=this._indicesByUUID,i=this._paths,n=this._parsedPaths,r=this._bindings,a=r.length,o,l=t.length,c=this.nCachedObjects_;for(let h=0,d=arguments.length;h!==d;++h){let u=arguments[h],f=u.uuid,p=e[f];if(p===void 0){p=l++,e[f]=p,t.push(u);for(let _=0,g=a;_!==g;++_)r[_].push(new me(u,i[_],n[_]))}else if(p<c){o=t[p];let _=--c,g=t[_];e[g.uuid]=p,t[p]=g,e[f]=_,t[_]=u;for(let m=0,y=a;m!==y;++m){let w=r[m],x=w[_],M=w[p];w[p]=x,M===void 0&&(M=new me(u,i[m],n[m])),w[_]=M}}else t[p]!==o&&Dt("AnimationObjectGroup: Different objects with the same UUID detected. Clean the caches or recreate your infrastructure when reloading scenes.")}this.nCachedObjects_=c}remove(){let t=this._objects,e=this._indicesByUUID,i=this._bindings,n=i.length,r=this.nCachedObjects_;for(let a=0,o=arguments.length;a!==o;++a){let l=arguments[a],c=l.uuid,h=e[c];if(h!==void 0&&h>=r){let d=r++,u=t[d];e[u.uuid]=h,t[h]=u,e[c]=d,t[d]=l;for(let f=0,p=n;f!==p;++f){let _=i[f],g=_[d],m=_[h];_[h]=g,_[d]=m}}}this.nCachedObjects_=r}uncache(){let t=this._objects,e=this._indicesByUUID,i=this._bindings,n=i.length,r=this.nCachedObjects_,a=t.length;for(let o=0,l=arguments.length;o!==l;++o){let c=arguments[o],h=c.uuid,d=e[h];if(d!==void 0)if(delete e[h],d<r){let u=--r,f=t[u],p=--a,_=t[p];d!==u&&(e[f.uuid]=d),t[d]=f,u!==p&&(e[_.uuid]=u),t[u]=_,t.pop();for(let g=0,m=n;g!==m;++g){let y=i[g],w=y[u],x=y[p];y[d]=w,y[u]=x,y.pop()}}else{let u=--a,f=t[u];d!==u&&(e[f.uuid]=d),t[d]=f,t.pop();for(let p=0,_=n;p!==_;++p){let g=i[p];g[d]=g[u],g.pop()}}}this.nCachedObjects_=r}subscribe_(t,e){let i=this._bindingsIndicesByPath,n=i[t],r=this._bindings;if(n!==void 0)return r[n];let a=this._paths,o=this._parsedPaths,l=this._objects,c=l.length,h=this.nCachedObjects_,d=new Array(c);n=r.length,i[t]=n,a.push(t),o.push(e),r.push(d);for(let u=h,f=l.length;u!==f;++u){let p=l[u];d[u]=new me(p,t,e)}return d}unsubscribe_(t){let e=this._bindingsIndicesByPath,i=e[t];if(i!==void 0){let n=this._paths,r=this._parsedPaths,a=this._bindings,o=a.length-1,l=a[o],c=n[o];e[c]=i,a[i]=l,a.pop(),r[i]=r[o],r.pop(),n[i]=n[o],n.pop()}}},dl=class{constructor(t,e,i=null,n=e.blendMode){this._mixer=t,this._clip=e,this._localRoot=i,this.blendMode=n;let r=e.tracks,a=r.length,o=new Array(a),l={endingStart:Jn,endingEnd:Jn};for(let c=0;c!==a;++c){let h=r[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=vf,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(t){return this._startTime=t,this}setLoop(t,e){return this.loop=t,this.repetitions=e,this}setEffectiveWeight(t){return this.weight=t,this._effectiveWeight=this.enabled?t:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(t){return this._scheduleFading(t,0,1)}fadeOut(t){return this._scheduleFading(t,1,0)}crossFadeFrom(t,e,i=!1){if(t.fadeOut(e),this.fadeIn(e),i===!0){let n=this._clip.duration,r=t._clip.duration,a=r/n,o=n/r;t._restoreTimeScale=t.timeScale,this._restoreTimeScale=this.timeScale,t.warp(1,a,e),this.warp(o,1,e)}return this}crossFadeTo(t,e,i=!1){return t.crossFadeFrom(this,e,i)}stopFading(){let t=this._weightInterpolant;return t!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(t)),this}setEffectiveTimeScale(t){return this.timeScale=t,this._effectiveTimeScale=this.paused?0:t,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(t){return this.timeScale=this._clip.duration/t,this.stopWarping()}syncWith(t){return this.time=t.time,this.timeScale=t.timeScale,this.stopWarping()}halt(t){return this.warp(this._effectiveTimeScale,0,t)}warp(t,e,i){let n=this._mixer,r=n.time,a=this.timeScale,o=this._timeScaleInterpolant;o===null&&(o=n._lendControlInterpolant(),this._timeScaleInterpolant=o);let l=o.parameterPositions,c=o.sampleValues;return l[0]=r,l[1]=r+i,c[0]=t/a,c[1]=e/a,this}stopWarping(){let t=this._timeScaleInterpolant;return t!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(t)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(t,e,i,n){if(!this.enabled){this._updateWeight(t);return}let r=this._startTime;if(r!==null){let l=(t-r)*i;l<0||i===0?e=0:(this._startTime=null,e=i*l)}e*=this._updateTimeScale(t);let a=this._updateTime(e),o=this._updateWeight(t);if(o>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case Mu:for(let h=0,d=l.length;h!==d;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);break;case Kl:default:for(let h=0,d=l.length;h!==d;++h)l[h].evaluate(a),c[h].accumulate(n,o)}}}_updateWeight(t){let e=0;if(this.enabled){e=this.weight;let i=this._weightInterpolant;if(i!==null){let n=i.evaluate(t)[0];e*=n,t>i.parameterPositions[1]&&(this.stopFading(),n===0&&(this.enabled=!1))}}return this._effectiveWeight=e,e}_updateTimeScale(t){let e=0;if(!this.paused){e=this.timeScale;let i=this._timeScaleInterpolant;if(i!==null){let n=i.evaluate(t)[0];e*=n,t>i.parameterPositions[1]&&(e===0?this.paused=!0:(this._restoreTimeScale!==null&&(e=this._restoreTimeScale),this.timeScale=e),this.stopWarping())}}return this._effectiveTimeScale=e,e}_updateTime(t){let e=this._clip.duration,i=this.loop,n=this.time+t,r=this._loopCount,a=i===yf;if(t===0)return r===-1?n:a&&(r&1)===1?e-n:n;if(i===xf){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));t:{if(n>=e)n=e;else if(n<0)n=0;else{this.time=n;break t}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=n,this._mixer.dispatchEvent({type:"finished",action:this,direction:t<0?-1:1})}}else{if(r===-1&&(t>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),n>=e||n<0){let o=Math.floor(n/e);n-=e*o,r+=Math.abs(o);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,n=t>0?e:0,this.time=n,this._mixer.dispatchEvent({type:"finished",action:this,direction:t>0?1:-1});else{if(l===1){let c=t<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=n,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this._loopCount=r,this.time=n;if(a&&(r&1)===1)return e-n}return n}_setEndings(t,e,i){let n=this._interpolantSettings;i?(n.endingStart=Kn,n.endingEnd=Kn):(t?n.endingStart=this.zeroSlopeAtStart?Kn:Jn:n.endingStart=Br,e?n.endingEnd=this.zeroSlopeAtEnd?Kn:Jn:n.endingEnd=Br)}_scheduleFading(t,e,i){let n=this._mixer,r=n.time,a=this._weightInterpolant;a===null&&(a=n._lendControlInterpolant(),this._weightInterpolant=a);let o=a.parameterPositions,l=a.sampleValues;return o[0]=r,l[0]=e,o[1]=r+t,l[1]=i,this}},Dx=new Float32Array(1),Bh=class extends vi{constructor(t){super(),this._root=t,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(t,e){let i=t._localRoot||this._root,n=t._clip.tracks,r=n.length,a=t._propertyBindings,o=t._interpolants,l=i.uuid,c=this._bindingsByRootAndName,h=c[l];h===void 0&&(h={},c[l]=h);for(let d=0;d!==r;++d){let u=n[d],f=u.name,p=h[f];if(p!==void 0)++p.referenceCount,a[d]=p;else{if(p=a[d],p!==void 0){p._cacheIndex===null&&(++p.referenceCount,this._addInactiveBinding(p,l,f));continue}let _=e&&e._propertyBindings[d].binding.parsedPath;p=new ul(me.create(i,f,_),u.ValueTypeName,u.getValueSize()),++p.referenceCount,this._addInactiveBinding(p,l,f),a[d]=p}o[d].resultBuffer=p.buffer}}_activateAction(t){if(!this._isActiveAction(t)){if(t._cacheIndex===null){let i=(t._localRoot||this._root).uuid,n=t._clip.uuid,r=this._actionsByClip[n];this._bindAction(t,r&&r.knownActions[0]),this._addInactiveAction(t,n,i)}let e=t._propertyBindings;for(let i=0,n=e.length;i!==n;++i){let r=e[i];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(t)}}_deactivateAction(t){if(this._isActiveAction(t)){let e=t._propertyBindings;for(let i=0,n=e.length;i!==n;++i){let r=e[i];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(t)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let t=this;this.stats={actions:{get total(){return t._actions.length},get inUse(){return t._nActiveActions}},bindings:{get total(){return t._bindings.length},get inUse(){return t._nActiveBindings}},controlInterpolants:{get total(){return t._controlInterpolants.length},get inUse(){return t._nActiveControlInterpolants}}}}_isActiveAction(t){let e=t._cacheIndex;return e!==null&&e<this._nActiveActions}_addInactiveAction(t,e,i){let n=this._actions,r=this._actionsByClip,a=r[e];if(a===void 0)a={knownActions:[t],actionByRoot:{}},t._byClipCacheIndex=0,r[e]=a;else{let o=a.knownActions;t._byClipCacheIndex=o.length,o.push(t)}t._cacheIndex=n.length,n.push(t),a.actionByRoot[i]=t}_removeInactiveAction(t){let e=this._actions,i=e[e.length-1],n=t._cacheIndex;i._cacheIndex=n,e[n]=i,e.pop(),t._cacheIndex=null;let r=t._clip.uuid,a=this._actionsByClip,o=a[r],l=o.knownActions,c=l[l.length-1],h=t._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),t._byClipCacheIndex=null;let d=o.actionByRoot,u=(t._localRoot||this._root).uuid;delete d[u],l.length===0&&delete a[r],this._removeInactiveBindingsForAction(t)}_removeInactiveBindingsForAction(t){let e=t._propertyBindings;for(let i=0,n=e.length;i!==n;++i){let r=e[i];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(t){let e=this._actions,i=t._cacheIndex,n=this._nActiveActions++,r=e[n];t._cacheIndex=n,e[n]=t,r._cacheIndex=i,e[i]=r}_takeBackAction(t){let e=this._actions,i=t._cacheIndex,n=--this._nActiveActions,r=e[n];t._cacheIndex=n,e[n]=t,r._cacheIndex=i,e[i]=r}_addInactiveBinding(t,e,i){let n=this._bindingsByRootAndName,r=this._bindings,a=n[e];a===void 0&&(a={},n[e]=a),a[i]=t,t._cacheIndex=r.length,r.push(t)}_removeInactiveBinding(t){let e=this._bindings,i=t.binding,n=i.rootNode.uuid,r=i.path,a=this._bindingsByRootAndName,o=a[n],l=e[e.length-1],c=t._cacheIndex;l._cacheIndex=c,e[c]=l,e.pop(),delete o[r],Object.keys(o).length===0&&delete a[n]}_lendBinding(t){let e=this._bindings,i=t._cacheIndex,n=this._nActiveBindings++,r=e[n];t._cacheIndex=n,e[n]=t,r._cacheIndex=i,e[i]=r}_takeBackBinding(t){let e=this._bindings,i=t._cacheIndex,n=--this._nActiveBindings,r=e[n];t._cacheIndex=n,e[n]=t,r._cacheIndex=i,e[i]=r}_lendControlInterpolant(){let t=this._controlInterpolants,e=this._nActiveControlInterpolants++,i=t[e];return i===void 0&&(i=new sa(new Float32Array(2),new Float32Array(2),1,Dx),i.__cacheIndex=e,t[e]=i),i}_takeBackControlInterpolant(t){let e=this._controlInterpolants,i=t.__cacheIndex,n=--this._nActiveControlInterpolants,r=e[n];t.__cacheIndex=n,e[n]=t,r.__cacheIndex=i,e[i]=r}clipAction(t,e,i){let n=e||this._root,r=n.uuid,a=typeof t=="string"?os.findByName(n,t):t,o=a!==null?a.uuid:t,l=this._actionsByClip[o],c=null;if(i===void 0&&(a!==null?i=a.blendMode:i=Kl),l!==void 0){let d=l.actionByRoot[r];if(d!==void 0&&d.blendMode===i)return d;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;let h=new dl(this,a,e,i);return this._bindAction(h,c),this._addInactiveAction(h,o,r),h}existingAction(t,e){let i=e||this._root,n=i.uuid,r=typeof t=="string"?os.findByName(i,t):t,a=r?r.uuid:t,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[n]||null}stopAllAction(){let t=this._actions,e=this._nActiveActions;for(let i=e-1;i>=0;--i)t[i].stop();return this}update(t){t*=this.timeScale;let e=this._actions,i=this._nActiveActions,n=this.time+=t,r=Math.sign(t),a=this._accuIndex^=1;for(let c=0;c!==i;++c)e[c]._update(n,t,r,a);let o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(t){this.time=0;for(let e=0;e<this._actions.length;e++)this._actions[e].time=0;return this.update(t)}getRoot(){return this._root}uncacheClip(t){let e=this._actions,i=t.uuid,n=this._actionsByClip,r=n[i];if(r!==void 0){let a=r.knownActions;for(let o=0,l=a.length;o!==l;++o){let c=a[o];this._deactivateAction(c);let h=c._cacheIndex,d=e[e.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,d._cacheIndex=h,e[h]=d,e.pop(),this._removeInactiveBindingsForAction(c)}delete n[i]}}uncacheRoot(t){let e=t.uuid,i=this._actionsByClip;for(let a in i){let o=i[a].actionByRoot,l=o[e];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let n=this._bindingsByRootAndName,r=n[e];if(r!==void 0)for(let a in r){let o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(t,e){let i=this.existingAction(t,e);i!==null&&(this._deactivateAction(i),this._removeInactiveAction(i))}},zh=class extends Hr{constructor(t=1,e=1,i=1,n={}){super(t,e,n),this.isRenderTarget3D=!0,this.depth=i;for(let r=0;r<this.textures.length;r++){let a=new Ds(null,t,e,i);a.isRenderTargetTexture=!0,a.renderTarget=this,this.textures[r]=a}this._setTextureOptions(n)}},kh=class s{constructor(t){this.value=t}clone(){return new s(this.value.clone===void 0?this.value:this.value.clone())}},Nx=0,Vh=class extends vi{constructor(){super(),this.isUniformsGroup=!0,Object.defineProperty(this,"id",{value:Nx++}),this.name="",this.usage=tc,this.uniforms=[]}add(t){return this.uniforms.push(t),this}remove(t){let e=this.uniforms.indexOf(t);return e!==-1&&this.uniforms.splice(e,1),this}setName(t){return this.name=t,this}setUsage(t){return this.usage=t,this}dispose(){this.dispatchEvent({type:"dispose"})}copy(t){this.name=t.name,this.usage=t.usage;let e=t.uniforms;this.uniforms.length=0;for(let i=0,n=e.length;i<n;i++){let r=Array.isArray(e[i])?e[i]:[e[i]];for(let a=0;a<r.length;a++)this.uniforms.push(r[a].clone())}return this}clone(){return new this.constructor().copy(this)}},Gh=class extends Os{constructor(t,e,i=1){super(t,e),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}clone(t){let e=super.clone(t);return e.meshPerAttribute=this.meshPerAttribute,e}toJSON(t){let e=super.toJSON(t);return e.isInstancedInterleavedBuffer=!0,e.meshPerAttribute=this.meshPerAttribute,e}},Hh=class{constructor(t,e,i,n,r,a=!1){this.isGLBufferAttribute=!0,this.name="",this.buffer=t,this.type=e,this.itemSize=i,this.elementSize=n,this.count=r,this.normalized=a,this.version=0}set needsUpdate(t){t===!0&&this.version++}setBuffer(t){return this.buffer=t,this}setType(t,e){return this.type=t,this.elementSize=e,this}setItemSize(t){return this.itemSize=t,this}setCount(t){return this.count=t,this}},bm=new Ht,ua=class{constructor(t,e,i=0,n=1/0){this.ray=new Qi(t,e),this.near=i,this.far=n,this.camera=null,this.layers=new Ns,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Dt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return bm.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(bm),this}intersectObject(t,e=!0,i=[]){return Xd(t,this,i,e),i.sort(Sm),i}intersectObjects(t,e=!0,i=[]){for(let n=0,r=t.length;n<r;n++)Xd(t[n],this,i,e);return i.sort(Sm),i}};function Sm(s,t){return s.distance-t.distance}function Xd(s,t,e,i){let n=!0;if(s.layers.test(t.layers)&&s.raycast(t,e)===!1&&(n=!1),n===!0&&i===!0){let r=s.children;for(let a=0,o=r.length;a<o;a++)Xd(r[a],t,e,!0)}}var Wh=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,pt("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=performance.now();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}},Qs=class{constructor(t=1,e=0,i=0){this.radius=t,this.phi=e,this.theta=i}set(t,e,i){return this.radius=t,this.phi=e,this.theta=i,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Xt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,i){return this.radius=Math.sqrt(t*t+e*e+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,i),this.phi=Math.acos(Xt(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}},Xh=class{constructor(t=1,e=0,i=0){this.radius=t,this.theta=e,this.y=i}set(t,e,i){return this.radius=t,this.theta=e,this.y=i,this}copy(t){return this.radius=t.radius,this.theta=t.theta,this.y=t.y,this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,i){return this.radius=Math.sqrt(t*t+i*i),this.theta=Math.atan2(t,i),this.y=e,this}clone(){return new this.constructor().copy(this)}},qh=class s{static{s.prototype.isMatrix2=!0}constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=n,this}},wm=new q,fl=class{constructor(t=new q(1/0,1/0),e=new q(-1/0,-1/0)){this.isBox2=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=wm.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=1/0,this.max.x=this.max.y=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y}getCenter(t){return this.isEmpty()?t.set(0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,wm).distanceTo(t)}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},Tm=new C,jc=new C,Ir=new C,Lr=new C,Id=new C,Ux=new C,Fx=new C,Yh=class{constructor(t=new C,e=new C){this.start=t,this.end=e}set(t,e){return this.start.copy(t),this.end.copy(e),this}copy(t){return this.start.copy(t.start),this.end.copy(t.end),this}getCenter(t){return t.addVectors(this.start,this.end).multiplyScalar(.5)}delta(t){return t.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(t,e){return this.delta(e).multiplyScalar(t).add(this.start)}closestPointToPointParameter(t,e){Tm.subVectors(t,this.start),jc.subVectors(this.end,this.start);let i=jc.dot(jc);if(i===0)return 0;let r=jc.dot(Tm)/i;return e&&(r=Xt(r,0,1)),r}closestPointToPoint(t,e,i){let n=this.closestPointToPointParameter(t,e);return this.delta(i).multiplyScalar(n).add(this.start)}distanceSqToLine3(t,e=Ux,i=Fx){let n=10000000000000001e-32,r,a,o=this.start,l=t.start,c=this.end,h=t.end;Ir.subVectors(c,o),Lr.subVectors(h,l),Id.subVectors(o,l);let d=Ir.dot(Ir),u=Lr.dot(Lr),f=Lr.dot(Id);if(d<=n&&u<=n)return e.copy(o),i.copy(l),e.sub(i),e.dot(e);if(d<=n)r=0,a=f/u,a=Xt(a,0,1);else{let p=Ir.dot(Id);if(u<=n)a=0,r=Xt(-p/d,0,1);else{let _=Ir.dot(Lr),g=d*u-_*_;g!==0?r=Xt((_*f-p*u)/g,0,1):r=0,a=(_*r+f)/u,a<0?(a=0,r=Xt(-p/d,0,1)):a>1&&(a=1,r=Xt((_-p)/d,0,1))}}return e.copy(o).addScaledVector(Ir,r),i.copy(l).addScaledVector(Lr,a),e.distanceToSquared(i)}applyMatrix4(t){return this.start.applyMatrix4(t),this.end.applyMatrix4(t),this}equals(t){return t.start.equals(this.start)&&t.end.equals(this.end)}clone(){return new this.constructor().copy(this)}},Em=new C,Zh=class extends re{constructor(t,e){super(),this.light=t,this.matrixAutoUpdate=!1,this.color=e,this.type="SpotLightHelper";let i=new kt,n=[0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,-1,0,1,0,0,0,0,1,1,0,0,0,0,-1,1];for(let a=0,o=1,l=32;a<l;a++,o++){let c=a/l*Math.PI*2,h=o/l*Math.PI*2;n.push(Math.cos(c),Math.sin(c),1,Math.cos(h),Math.sin(h),1)}i.setAttribute("position",new vt(n,3));let r=new Ze({fog:!1,toneMapped:!1});this.cone=new Ai(i,r),this.add(this.cone),this.update()}dispose(){super.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}update(){this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),this.parent?(this.parent.updateWorldMatrix(!0),this.matrix.copy(this.parent.matrixWorld).invert().multiply(this.light.matrixWorld)):this.matrix.copy(this.light.matrixWorld),this.matrixWorldNeedsUpdate=!0;let t=this.light.distance?this.light.distance:1e3,e=t*Math.tan(this.light.angle);this.cone.scale.set(e,e,t),Em.setFromMatrixPosition(this.light.target.matrixWorld),this.cone.lookAt(Em),this.color!==void 0?this.cone.material.color.set(this.color):this.cone.material.color.copy(this.light.color)}},$n=new C,Qc=new Ht,Ld=new Ht,$h=class extends Ai{constructor(t){let e=Og(t),i=new kt,n=[],r=[];for(let c=0;c<e.length;c++){let h=e[c];h.parent&&h.parent.isBone&&(n.push(0,0,0),n.push(0,0,0),r.push(0,0,0),r.push(0,0,0))}i.setAttribute("position",new vt(n,3)),i.setAttribute("color",new vt(r,3));let a=new Ze({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0});super(i,a),this.isSkeletonHelper=!0,this.type="SkeletonHelper",this.root=t,this.bones=e,this.matrix=t.matrixWorld,this.matrixAutoUpdate=!1;let o=new at(255),l=new at(65280);this.setColors(o,l)}updateMatrixWorld(t){let e=this.bones,i=this.geometry,n=i.getAttribute("position");Ld.copy(this.root.matrixWorld).invert();for(let r=0,a=0;r<e.length;r++){let o=e[r];o.parent&&o.parent.isBone&&(Qc.multiplyMatrices(Ld,o.matrixWorld),$n.setFromMatrixPosition(Qc),n.setXYZ(a,$n.x,$n.y,$n.z),Qc.multiplyMatrices(Ld,o.parent.matrixWorld),$n.setFromMatrixPosition(Qc),n.setXYZ(a+1,$n.x,$n.y,$n.z),a+=2)}i.getAttribute("position").needsUpdate=!0,super.updateMatrixWorld(t)}setColors(t,e){let n=this.geometry.getAttribute("color");for(let r=0;r<n.count;r+=2)n.setXYZ(r,t.r,t.g,t.b),n.setXYZ(r+1,e.r,e.g,e.b);return n.needsUpdate=!0,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};function Og(s){let t=[];s.isBone===!0&&t.push(s);for(let e=0;e<s.children.length;e++)t.push(...Og(s.children[e]));return t}var Jh=class extends ee{constructor(t,e,i){let n=new ea(e,4,2),r=new ce({wireframe:!0,fog:!1,toneMapped:!1});super(n,r),this.light=t,this.color=i,this.type="PointLightHelper",this.matrix=this.light.matrixWorld,this.matrixAutoUpdate=!1,this.update()}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}update(){this.matrixWorldNeedsUpdate=!0,this.light.updateWorldMatrix(!0,!1),this.color!==void 0?this.material.color.set(this.color):this.material.color.copy(this.light.color)}},Ox=new C,Am=new at,Cm=new at,Kh=class extends re{constructor(t,e,i){super(),this.light=t,this.matrix=t.matrixWorld,this.matrixAutoUpdate=!1,this.color=i,this.type="HemisphereLightHelper";let n=new ki(e);n.rotateY(Math.PI*.5),this.material=new ce({wireframe:!0,fog:!1,toneMapped:!1}),this.color===void 0&&(this.material.vertexColors=!0);let r=n.getAttribute("position"),a=new Float32Array(r.count*3);n.setAttribute("color",new he(a,3)),this.add(new ee(n,this.material)),this.update()}dispose(){super.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()}update(){let t=this.children[0];if(this.color!==void 0)this.material.color.set(this.color);else{let e=t.geometry.getAttribute("color");Am.copy(this.light.color),Cm.copy(this.light.groundColor);for(let i=0,n=e.count;i<n;i++){let r=i<n/2?Am:Cm;e.setXYZ(i,r.r,r.g,r.b)}e.needsUpdate=!0}this.matrixWorldNeedsUpdate=!0,this.light.updateWorldMatrix(!0,!1),t.lookAt(Ox.setFromMatrixPosition(this.light.matrixWorld).negate())}},jh=class extends Ai{constructor(t=10,e=10,i=4473924,n=8947848){i=new at(i),n=new at(n);let r=e/2,a=t/e,o=t/2,l=[],c=[];for(let u=0,f=0,p=-o;u<=e;u++,p+=a){l.push(-o,0,p,o,0,p),l.push(p,0,-o,p,0,o);let _=u===r?i:n;_.toArray(c,f),f+=3,_.toArray(c,f),f+=3,_.toArray(c,f),f+=3,_.toArray(c,f),f+=3}let h=new kt;h.setAttribute("position",new vt(l,3)),h.setAttribute("color",new vt(c,3));let d=new Ze({vertexColors:!0,toneMapped:!1});super(h,d),this.type="GridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},Qh=class extends Ai{constructor(t=10,e=16,i=8,n=64,r=4473924,a=8947848){r=new at(r),a=new at(a);let o=[],l=[];if(e>1)for(let d=0;d<e;d++){let u=d/e*(Math.PI*2),f=Math.sin(u)*t,p=Math.cos(u)*t;o.push(0,0,0),o.push(f,0,p);let _=d&1?r:a;l.push(_.r,_.g,_.b),l.push(_.r,_.g,_.b)}for(let d=0;d<i;d++){let u=d&1?r:a,f=t-t/i*d;for(let p=0;p<n;p++){let _=p/n*(Math.PI*2),g=Math.sin(_)*f,m=Math.cos(_)*f;o.push(g,0,m),l.push(u.r,u.g,u.b),_=(p+1)/n*(Math.PI*2),g=Math.sin(_)*f,m=Math.cos(_)*f,o.push(g,0,m),l.push(u.r,u.g,u.b)}}let c=new kt;c.setAttribute("position",new vt(o,3)),c.setAttribute("color",new vt(l,3));let h=new Ze({vertexColors:!0,toneMapped:!1});super(c,h),this.type="PolarGridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},Rm=new C,th=new C,Pm=new C,tu=class extends re{constructor(t,e,i){super(),this.light=t,this.matrix=t.matrixWorld,this.matrixAutoUpdate=!1,this.color=i,this.type="DirectionalLightHelper",e===void 0&&(e=1);let n=new kt;n.setAttribute("position",new vt([-e,e,0,e,e,0,e,-e,0,-e,-e,0,-e,e,0],3));let r=new Ze({fog:!1,toneMapped:!1});this.lightPlane=new tn(n,r),this.add(this.lightPlane),n=new kt,n.setAttribute("position",new vt([0,0,0,0,0,1],3)),this.targetLine=new tn(n,r),this.add(this.targetLine),this.update()}dispose(){super.dispose(),this.lightPlane.geometry.dispose(),this.lightPlane.material.dispose(),this.targetLine.geometry.dispose(),this.targetLine.material.dispose()}update(){this.matrixWorldNeedsUpdate=!0,this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),Rm.setFromMatrixPosition(this.light.matrixWorld),th.setFromMatrixPosition(this.light.target.matrixWorld),Pm.subVectors(th,Rm),this.lightPlane.lookAt(th),this.color!==void 0?(this.lightPlane.material.color.set(this.color),this.targetLine.material.color.set(this.color)):(this.lightPlane.material.color.copy(this.light.color),this.targetLine.material.color.copy(this.light.color)),this.targetLine.lookAt(th),this.targetLine.scale.z=Pm.length()}},eh=new C,Pe=new $s,eu=class extends Ai{constructor(t){let e=new kt,i=new Ze({color:16777215,vertexColors:!0,toneMapped:!1}),n=[],r=[],a={};o("n1","n2"),o("n2","n4"),o("n4","n3"),o("n3","n1"),o("f1","f2"),o("f2","f4"),o("f4","f3"),o("f3","f1"),o("n1","f1"),o("n2","f2"),o("n3","f3"),o("n4","f4"),o("p","n1"),o("p","n2"),o("p","n3"),o("p","n4"),o("u1","u2"),o("u2","u3"),o("u3","u1"),o("c","t"),o("p","c"),o("cn1","cn2"),o("cn3","cn4"),o("cf1","cf2"),o("cf3","cf4");function o(p,_){l(p),l(_)}function l(p){n.push(0,0,0),r.push(0,0,0),a[p]===void 0&&(a[p]=[]),a[p].push(n.length/3-1)}e.setAttribute("position",new vt(n,3)),e.setAttribute("color",new vt(r,3)),super(e,i),this.type="CameraHelper",this.camera=t,this.camera.updateProjectionMatrix&&this.camera.updateProjectionMatrix(),this.matrix=t.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=a,this.update();let c=new at(16755200),h=new at(16711680),d=new at(43775),u=new at(16777215),f=new at(3355443);this.setColors(c,h,d,u,f)}setColors(t,e,i,n,r){let o=this.geometry.getAttribute("color");return o.setXYZ(0,t.r,t.g,t.b),o.setXYZ(1,t.r,t.g,t.b),o.setXYZ(2,t.r,t.g,t.b),o.setXYZ(3,t.r,t.g,t.b),o.setXYZ(4,t.r,t.g,t.b),o.setXYZ(5,t.r,t.g,t.b),o.setXYZ(6,t.r,t.g,t.b),o.setXYZ(7,t.r,t.g,t.b),o.setXYZ(8,t.r,t.g,t.b),o.setXYZ(9,t.r,t.g,t.b),o.setXYZ(10,t.r,t.g,t.b),o.setXYZ(11,t.r,t.g,t.b),o.setXYZ(12,t.r,t.g,t.b),o.setXYZ(13,t.r,t.g,t.b),o.setXYZ(14,t.r,t.g,t.b),o.setXYZ(15,t.r,t.g,t.b),o.setXYZ(16,t.r,t.g,t.b),o.setXYZ(17,t.r,t.g,t.b),o.setXYZ(18,t.r,t.g,t.b),o.setXYZ(19,t.r,t.g,t.b),o.setXYZ(20,t.r,t.g,t.b),o.setXYZ(21,t.r,t.g,t.b),o.setXYZ(22,t.r,t.g,t.b),o.setXYZ(23,t.r,t.g,t.b),o.setXYZ(24,e.r,e.g,e.b),o.setXYZ(25,e.r,e.g,e.b),o.setXYZ(26,e.r,e.g,e.b),o.setXYZ(27,e.r,e.g,e.b),o.setXYZ(28,e.r,e.g,e.b),o.setXYZ(29,e.r,e.g,e.b),o.setXYZ(30,e.r,e.g,e.b),o.setXYZ(31,e.r,e.g,e.b),o.setXYZ(32,i.r,i.g,i.b),o.setXYZ(33,i.r,i.g,i.b),o.setXYZ(34,i.r,i.g,i.b),o.setXYZ(35,i.r,i.g,i.b),o.setXYZ(36,i.r,i.g,i.b),o.setXYZ(37,i.r,i.g,i.b),o.setXYZ(38,n.r,n.g,n.b),o.setXYZ(39,n.r,n.g,n.b),o.setXYZ(40,r.r,r.g,r.b),o.setXYZ(41,r.r,r.g,r.b),o.setXYZ(42,r.r,r.g,r.b),o.setXYZ(43,r.r,r.g,r.b),o.setXYZ(44,r.r,r.g,r.b),o.setXYZ(45,r.r,r.g,r.b),o.setXYZ(46,r.r,r.g,r.b),o.setXYZ(47,r.r,r.g,r.b),o.setXYZ(48,r.r,r.g,r.b),o.setXYZ(49,r.r,r.g,r.b),o.needsUpdate=!0,this}update(){let t=this.geometry,e=this.pointMap,i=1,n=1,r,a;if(Pe.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),this.camera.reversedDepth===!0)r=1,a=0;else if(this.camera.coordinateSystem===xi)r=-1,a=1;else if(this.camera.coordinateSystem===jn)r=0,a=1;else throw new Error("THREE.CameraHelper.update(): Invalid coordinate system: "+this.camera.coordinateSystem);Ue("c",e,t,Pe,0,0,r),Ue("t",e,t,Pe,0,0,a),Ue("n1",e,t,Pe,-i,-n,r),Ue("n2",e,t,Pe,i,-n,r),Ue("n3",e,t,Pe,-i,n,r),Ue("n4",e,t,Pe,i,n,r),Ue("f1",e,t,Pe,-i,-n,a),Ue("f2",e,t,Pe,i,-n,a),Ue("f3",e,t,Pe,-i,n,a),Ue("f4",e,t,Pe,i,n,a),Ue("u1",e,t,Pe,i*.7,n*1.1,r),Ue("u2",e,t,Pe,-i*.7,n*1.1,r),Ue("u3",e,t,Pe,0,n*2,r),Ue("cf1",e,t,Pe,-i,0,a),Ue("cf2",e,t,Pe,i,0,a),Ue("cf3",e,t,Pe,0,-n,a),Ue("cf4",e,t,Pe,0,n,a),Ue("cn1",e,t,Pe,-i,0,r),Ue("cn2",e,t,Pe,i,0,r),Ue("cn3",e,t,Pe,0,-n,r),Ue("cn4",e,t,Pe,0,n,r),t.getAttribute("position").needsUpdate=!0}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};function Ue(s,t,e,i,n,r,a){eh.set(n,r,a).unproject(i);let o=t[s];if(o!==void 0){let l=e.getAttribute("position");for(let c=0,h=o.length;c<h;c++)l.setXYZ(o[c],eh.x,eh.y,eh.z)}}var ih=new He,iu=class extends Ai{constructor(t,e=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),n=new Float32Array(24),r=new kt;r.setIndex(new he(i,1)),r.setAttribute("position",new he(n,3)),super(r,new Ze({color:e,toneMapped:!1})),this.object=t,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(){if(this.object!==void 0&&ih.setFromObject(this.object),ih.isEmpty())return;let t=ih.min,e=ih.max,i=this.geometry.attributes.position,n=i.array;n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=t.x,n[4]=e.y,n[5]=e.z,n[6]=t.x,n[7]=t.y,n[8]=e.z,n[9]=e.x,n[10]=t.y,n[11]=e.z,n[12]=e.x,n[13]=e.y,n[14]=t.z,n[15]=t.x,n[16]=e.y,n[17]=t.z,n[18]=t.x,n[19]=t.y,n[20]=t.z,n[21]=e.x,n[22]=t.y,n[23]=t.z,i.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(t){return this.object=t,this.update(),this}copy(t,e){return super.copy(t,e),this.object=t.object,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},nu=class extends Ai{constructor(t,e=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),n=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],r=new kt;r.setIndex(new he(i,1)),r.setAttribute("position",new vt(n,3)),super(r,new Ze({color:e,toneMapped:!1})),this.box=t,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(t){let e=this.box;e.isEmpty()||(e.getCenter(this.position),e.getSize(this.scale),this.scale.multiplyScalar(.5),super.updateMatrixWorld(t))}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},su=class extends tn{constructor(t,e=1,i=16776960){let n=i,r=[1,-1,0,-1,1,0,-1,-1,0,1,1,0,-1,1,0,-1,-1,0,1,-1,0,1,1,0],a=new kt;a.setAttribute("position",new vt(r,3)),a.computeBoundingSphere(),super(a,new Ze({color:n,toneMapped:!1})),this.type="PlaneHelper",this.plane=t,this.size=e;let o=[1,1,0,-1,1,0,-1,-1,0,1,1,0,-1,-1,0,1,-1,0],l=new kt;l.setAttribute("position",new vt(o,3)),l.computeBoundingSphere(),this.add(new ee(l,new ce({color:n,opacity:.2,transparent:!0,depthWrite:!1,toneMapped:!1})))}updateMatrixWorld(t){this.position.set(0,0,0),this.scale.set(.5*this.size,.5*this.size,1),this.lookAt(this.plane.normal),this.translateZ(-this.plane.constant),super.updateMatrixWorld(t)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()}},Im=new C,nh,Dd,ru=class extends re{constructor(t=new C(0,0,1),e=new C(0,0,0),i=1,n=16776960,r=i*.2,a=r*.2){super(),this.type="ArrowHelper",nh===void 0&&(nh=new kt,nh.setAttribute("position",new vt([0,0,0,0,1,0],3)),Dd=new Zr(.5,1,5,1),Dd.translate(0,-.5,0)),this.position.copy(e),this.line=new tn(nh,new Ze({color:n,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new ee(Dd,new ce({color:n,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(t),this.setLength(i,r,a)}setDirection(t){if(t.y>.99999)this.quaternion.set(0,0,0,1);else if(t.y<-.99999)this.quaternion.set(1,0,0,0);else{Im.set(t.z,0,-t.x).normalize();let e=Math.acos(t.y);this.quaternion.setFromAxisAngle(Im,e)}}setLength(t,e=t*.2,i=e*.2){this.line.scale.set(1,Math.max(1e-4,t-e),1),this.line.updateMatrix(),this.cone.scale.set(i,e,i),this.cone.position.y=t,this.cone.updateMatrix()}setColor(t){this.line.material.color.set(t),this.cone.material.color.set(t)}copy(t){return super.copy(t,!1),this.line.copy(t.line),this.cone.copy(t.cone),this}dispose(){super.dispose(),this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}},au=class extends Ai{constructor(t=1){let e=[0,0,0,t,0,0,0,0,0,0,t,0,0,0,0,0,0,t],i=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],n=new kt;n.setAttribute("position",new vt(e,3)),n.setAttribute("color",new vt(i,3));let r=new Ze({vertexColors:!0,toneMapped:!1});super(n,r),this.type="AxesHelper"}setColors(t,e,i){let n=new at,r=this.geometry.attributes.color.array;return n.set(t),n.toArray(r,0),n.toArray(r,3),n.set(e),n.toArray(r,6),n.toArray(r,9),n.set(i),n.toArray(r,12),n.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},ou=class{constructor(){this.type="ShapePath",this.color=new at,this.subPaths=[],this.currentPath=null,this.userData={}}moveTo(t,e){return this.currentPath=new pn,this.subPaths.push(this.currentPath),this.currentPath.moveTo(t,e),this}lineTo(t,e){return this.currentPath.lineTo(t,e),this}quadraticCurveTo(t,e,i,n){return this.currentPath.quadraticCurveTo(t,e,i,n),this}bezierCurveTo(t,e,i,n,r,a){return this.currentPath.bezierCurveTo(t,e,i,n,r,a),this}splineThru(t){return this.currentPath.splineThru(t),this}toShapes(){function t(l,c){let h=!1,d=c.length;for(let u=0,f=d-1;u<d;f=u++){let p=c[u],_=c[f];p.y>l.y!=_.y>l.y&&l.x<(_.x-p.x)*(l.y-p.y)/(_.y-p.y)+p.x&&(h=!h)}return h}function e(l,c){let h=c.getCenter(new q);if(t(h,l))return h;let d=h.y,u=[],f=l.length;for(let p=0;p<f;p++){let _=l[p],g=l[(p+1)%f];if(_.y>d!=g.y>d){let m=_.x+(d-_.y)*(g.x-_.x)/(g.y-_.y);u.push(m)}}return u.length>1&&(u.sort((p,_)=>p-_),h.x=(u[0]+u[1])/2),h}let i=this.userData.style&&this.userData.style.fillRule||"nonzero";i!=="nonzero"&&i!=="evenodd"&&(pt('Fill-rule "'+i+'" is not supported, falling back to "nonzero".'),i="nonzero");let n=i==="nonzero"?(l=>l!==0):(l=>(l&1)!==0),r=[];for(let l of this.subPaths){let c=l.getPoints();if(c.length<3)continue;let h=Fi.area(c);if(h===0)continue;let d=new fl;for(let u=0;u<c.length;u++)d.expandByPoint(c[u]);r.push({subPath:l,points:c,boundingBox:d,interiorPoint:e(c,d),absArea:Math.abs(h),winding:h<0?-1:1,container:null,exclude:!1,role:null})}r.sort((l,c)=>c.absArea-l.absArea);for(let l=0;l<r.length;l++){let c=r[l],h=0;for(let d=l-1;d>=0;d--){let u=r[d];if(u.boundingBox.containsBox(c.boundingBox)&&t(c.interiorPoint,u.points)){c.container=u.exclude?u.container:u,h=u.winding,c.winding+=h;break}}n(c.winding)===n(h)&&(c.exclude=!0)}for(let l of r)l.exclude||(l.role=l.container===null||l.container.role==="hole"?"outer":"hole");let a=[],o=new Map;for(let l of r){if(l.exclude||l.role!=="outer")continue;let c=new zi;c.curves=l.subPath.curves,a.push(c),o.set(l,c)}for(let l of r){if(l.exclude||l.role!=="hole")continue;let c=o.get(l.container);if(!c)continue;let h=new pn;h.curves=l.subPath.curves,c.holes.push(h)}return a}},da=class extends vi{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function Bx(s,t){let e=s.image&&s.image.width?s.image.width/s.image.height:1;return e>t?(s.repeat.x=1,s.repeat.y=e/t,s.offset.x=0,s.offset.y=(1-s.repeat.y)/2):(s.repeat.x=t/e,s.repeat.y=1,s.offset.x=(1-s.repeat.x)/2,s.offset.y=0),s}function zx(s,t){let e=s.image&&s.image.width?s.image.width/s.image.height:1;return e>t?(s.repeat.x=t/e,s.repeat.y=1,s.offset.x=(1-s.repeat.x)/2,s.offset.y=0):(s.repeat.x=1,s.repeat.y=e/t,s.offset.x=0,s.offset.y=(1-s.repeat.y)/2),s}function kx(s){return s.repeat.x=1,s.repeat.y=1,s.offset.x=0,s.offset.y=0,s}function Su(s,t,e,i){let n=Vx(i);switch(e){case vu:return s*t;case xl:return s*t/n.components*n.byteLength;case wa:return s*t/n.components*n.byteLength;case zn:return s*t*2/n.components*n.byteLength;case vl:return s*t*2/n.components*n.byteLength;case yu:return s*t*3/n.components*n.byteLength;case si:return s*t*4/n.components*n.byteLength;case yl:return s*t*4/n.components*n.byteLength;case Ta:case Ea:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Aa:case Ca:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case bl:case wl:return Math.max(s,16)*Math.max(t,8)/4;case Ml:case Sl:return Math.max(s,8)*Math.max(t,8)/2;case Tl:case El:case Cl:case Rl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Al:case Ra:case Pl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Il:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ll:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case Dl:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case Nl:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case Ul:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case Fl:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Ol:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case Bl:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case zl:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case kl:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case Vl:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case Gl:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case Hl:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case Wl:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case Xl:case ql:case Yl:return Math.ceil(s/4)*Math.ceil(t/4)*16;case Zl:case $l:return Math.ceil(s/4)*Math.ceil(t/4)*8;case Pa:case Jl:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Vx(s){switch(s){case pi:case mu:return{byteLength:1,components:1};case sr:case gu:case $e:return{byteLength:2,components:1};case gl:case _l:return{byteLength:2,components:4};case Pi:case ml:case ni:return{byteLength:4,components:1};case _u:case xu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}var lu=class{static contain(t,e){return Bx(t,e)}static cover(t,e){return zx(t,e)}static fill(t){return kx(t)}static getByteLength(t,e,i,n){return Su(t,e,i,n)}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?pt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function r0(){let s=null,t=!1,e=null,i=null;function n(r,a){i=s.requestAnimationFrame(n),e(r,a)}return{start:function(){t!==!0&&e!==null&&s!==null&&(i=s.requestAnimationFrame(n),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Gx(s){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=s.createBuffer();s.bindBuffer(l,u),s.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){let h=l.array,d=l.updateRanges;if(s.bindBuffer(c,o),d.length===0)s.bufferSubData(c,0,h);else{d.sort((f,p)=>f.start-p.start);let u=0;for(let f=1;f<d.length;f++){let p=d[u],_=d[f];_.start<=p.start+p.count+1?p.count=Math.max(p.count,_.start+_.count-p.start):(++u,d[u]=_)}d.length=u+1;for(let f=0,p=d.length;f<p;f++){let _=d[f];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:n,remove:r,update:a}}var Hx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Wx=`#ifdef USE_ALPHAHASH
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
#endif`,Xx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,qx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Zx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,$x=`#ifdef USE_AOMAP
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
#endif`,Jx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Kx=`#ifdef USE_BATCHING
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
#endif`,jx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Qx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,tv=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ev=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,iv=`#ifdef USE_IRIDESCENCE
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
#endif`,nv=`#ifdef USE_BUMPMAP
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
#endif`,sv=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,rv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,av=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ov=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,lv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,cv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,hv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,uv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,dv=`#define PI 3.141592653589793
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
} // validated`,fv=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,pv=`vec3 transformedNormal = objectNormal;
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
#endif`,mv=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,gv=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,_v=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,xv=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,vv="gl_FragColor = linearToOutputTexel( gl_FragColor );",yv=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Mv=`#ifdef USE_ENVMAP
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
#endif`,bv=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Sv=`#ifdef USE_ENVMAP
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
#endif`,wv=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Tv=`#ifdef USE_ENVMAP
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
#endif`,Ev=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Av=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Cv=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Rv=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Pv=`#ifdef USE_GRADIENTMAP
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
}`,Iv=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Lv=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Dv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Nv=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Uv=`#ifdef USE_ENVMAP
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
#endif`,Fv=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ov=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Bv=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,zv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,kv=`PhysicalMaterial material;
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
#endif`,Vv=`uniform sampler2D dfgLUT;
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
}`,Gv=`
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
#endif`,Hv=`#if defined( RE_IndirectDiffuse )
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
#endif`,Wv=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Xv=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,qv=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Yv=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Zv=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$v=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Jv=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Kv=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,jv=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Qv=`#if defined( USE_POINTS_UV )
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
#endif`,ty=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ey=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,iy=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ny=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,sy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ry=`#ifdef USE_MORPHTARGETS
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
#endif`,ay=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,oy=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,ly=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,cy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,hy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,uy=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,dy=`#ifdef USE_NORMALMAP
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
#endif`,fy=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,py=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,my=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,gy=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,_y=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,xy=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,vy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,yy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,My=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,by=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Sy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,wy=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ty=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ey=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ay=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Cy=`float getShadowMask() {
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
}`,Ry=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Py=`#ifdef USE_SKINNING
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
#endif`,Iy=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Ly=`#ifdef USE_SKINNING
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
#endif`,Dy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Ny=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Uy=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Fy=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Oy=`#ifdef USE_TRANSMISSION
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
#endif`,By=`#ifdef USE_TRANSMISSION
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
#endif`,zy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ky=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Vy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Gy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Hy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Wy=`uniform sampler2D t2D;
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
}`,Xy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qy=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Yy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Zy=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$y=`#include <common>
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
}`,Jy=`#if DEPTH_PACKING == 3200
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
}`,Ky=`#define DISTANCE
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
}`,jy=`#define DISTANCE
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
}`,Qy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,tM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,eM=`uniform float scale;
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
}`,iM=`uniform vec3 diffuse;
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
}`,nM=`#include <common>
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
}`,sM=`uniform vec3 diffuse;
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
}`,rM=`#define LAMBERT
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
}`,aM=`#define LAMBERT
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
}`,oM=`#define MATCAP
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
}`,lM=`#define MATCAP
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
}`,cM=`#define NORMAL
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
}`,hM=`#define NORMAL
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
}`,uM=`#define PHONG
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
}`,dM=`#define PHONG
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
}`,fM=`#define STANDARD
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
}`,pM=`#define STANDARD
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
}`,mM=`#define TOON
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
}`,gM=`#define TOON
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
}`,_M=`uniform float size;
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
}`,xM=`uniform vec3 diffuse;
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
}`,vM=`#include <common>
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
}`,yM=`uniform vec3 color;
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
}`,MM=`uniform float rotation;
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
}`,bM=`uniform vec3 diffuse;
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
}`,jt={alphahash_fragment:Hx,alphahash_pars_fragment:Wx,alphamap_fragment:Xx,alphamap_pars_fragment:qx,alphatest_fragment:Yx,alphatest_pars_fragment:Zx,aomap_fragment:$x,aomap_pars_fragment:Jx,batching_pars_vertex:Kx,batching_vertex:jx,begin_vertex:Qx,beginnormal_vertex:tv,bsdfs:ev,iridescence_fragment:iv,bumpmap_pars_fragment:nv,clipping_planes_fragment:sv,clipping_planes_pars_fragment:rv,clipping_planes_pars_vertex:av,clipping_planes_vertex:ov,color_fragment:lv,color_pars_fragment:cv,color_pars_vertex:hv,color_vertex:uv,common:dv,cube_uv_reflection_fragment:fv,defaultnormal_vertex:pv,displacementmap_pars_vertex:mv,displacementmap_vertex:gv,emissivemap_fragment:_v,emissivemap_pars_fragment:xv,colorspace_fragment:vv,colorspace_pars_fragment:yv,envmap_fragment:Mv,envmap_common_pars_fragment:bv,envmap_pars_fragment:Sv,envmap_pars_vertex:wv,envmap_physical_pars_fragment:Uv,envmap_vertex:Tv,fog_vertex:Ev,fog_pars_vertex:Av,fog_fragment:Cv,fog_pars_fragment:Rv,gradientmap_pars_fragment:Pv,lightmap_pars_fragment:Iv,lights_lambert_fragment:Lv,lights_lambert_pars_fragment:Dv,lights_pars_begin:Nv,lights_toon_fragment:Fv,lights_toon_pars_fragment:Ov,lights_phong_fragment:Bv,lights_phong_pars_fragment:zv,lights_physical_fragment:kv,lights_physical_pars_fragment:Vv,lights_fragment_begin:Gv,lights_fragment_maps:Hv,lights_fragment_end:Wv,lightprobes_pars_fragment:Xv,logdepthbuf_fragment:qv,logdepthbuf_pars_fragment:Yv,logdepthbuf_pars_vertex:Zv,logdepthbuf_vertex:$v,map_fragment:Jv,map_pars_fragment:Kv,map_particle_fragment:jv,map_particle_pars_fragment:Qv,metalnessmap_fragment:ty,metalnessmap_pars_fragment:ey,morphinstance_vertex:iy,morphcolor_vertex:ny,morphnormal_vertex:sy,morphtarget_pars_vertex:ry,morphtarget_vertex:ay,normal_fragment_begin:oy,normal_fragment_maps:ly,normal_pars_fragment:cy,normal_pars_vertex:hy,normal_vertex:uy,normalmap_pars_fragment:dy,clearcoat_normal_fragment_begin:fy,clearcoat_normal_fragment_maps:py,clearcoat_pars_fragment:my,iridescence_pars_fragment:gy,opaque_fragment:_y,packing:xy,premultiplied_alpha_fragment:vy,project_vertex:yy,dithering_fragment:My,dithering_pars_fragment:by,roughnessmap_fragment:Sy,roughnessmap_pars_fragment:wy,shadowmap_pars_fragment:Ty,shadowmap_pars_vertex:Ey,shadowmap_vertex:Ay,shadowmask_pars_fragment:Cy,skinbase_vertex:Ry,skinning_pars_vertex:Py,skinning_vertex:Iy,skinnormal_vertex:Ly,specularmap_fragment:Dy,specularmap_pars_fragment:Ny,tonemapping_fragment:Uy,tonemapping_pars_fragment:Fy,transmission_fragment:Oy,transmission_pars_fragment:By,uv_pars_fragment:zy,uv_pars_vertex:ky,uv_vertex:Vy,worldpos_vertex:Gy,background_vert:Hy,background_frag:Wy,backgroundCube_vert:Xy,backgroundCube_frag:qy,cube_vert:Yy,cube_frag:Zy,depth_vert:$y,depth_frag:Jy,distance_vert:Ky,distance_frag:jy,equirect_vert:Qy,equirect_frag:tM,linedashed_vert:eM,linedashed_frag:iM,meshbasic_vert:nM,meshbasic_frag:sM,meshlambert_vert:rM,meshlambert_frag:aM,meshmatcap_vert:oM,meshmatcap_frag:lM,meshnormal_vert:cM,meshnormal_frag:hM,meshphong_vert:uM,meshphong_frag:dM,meshphysical_vert:fM,meshphysical_frag:pM,meshtoon_vert:mM,meshtoon_frag:gM,points_vert:_M,points_frag:xM,shadow_vert:vM,shadow_frag:yM,sprite_vert:MM,sprite_frag:bM},yt={common:{diffuse:{value:new at(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Zt}},envmap:{envMap:{value:null},envMapRotation:{value:new Zt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Zt},normalScale:{value:new q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new at(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new C},probesMax:{value:new C},probesResolution:{value:new C}},points:{diffuse:{value:new at(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0},uvTransform:{value:new Zt}},sprite:{diffuse:{value:new at(16777215)},opacity:{value:1},center:{value:new q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}}},an={basic:{uniforms:ai([yt.common,yt.specularmap,yt.envmap,yt.aomap,yt.lightmap,yt.fog]),vertexShader:jt.meshbasic_vert,fragmentShader:jt.meshbasic_frag},lambert:{uniforms:ai([yt.common,yt.specularmap,yt.envmap,yt.aomap,yt.lightmap,yt.emissivemap,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.fog,yt.lights,{emissive:{value:new at(0)},envMapIntensity:{value:1}}]),vertexShader:jt.meshlambert_vert,fragmentShader:jt.meshlambert_frag},phong:{uniforms:ai([yt.common,yt.specularmap,yt.envmap,yt.aomap,yt.lightmap,yt.emissivemap,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.fog,yt.lights,{emissive:{value:new at(0)},specular:{value:new at(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:jt.meshphong_vert,fragmentShader:jt.meshphong_frag},standard:{uniforms:ai([yt.common,yt.envmap,yt.aomap,yt.lightmap,yt.emissivemap,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.roughnessmap,yt.metalnessmap,yt.fog,yt.lights,{emissive:{value:new at(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:jt.meshphysical_vert,fragmentShader:jt.meshphysical_frag},toon:{uniforms:ai([yt.common,yt.aomap,yt.lightmap,yt.emissivemap,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.gradientmap,yt.fog,yt.lights,{emissive:{value:new at(0)}}]),vertexShader:jt.meshtoon_vert,fragmentShader:jt.meshtoon_frag},matcap:{uniforms:ai([yt.common,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.fog,{matcap:{value:null}}]),vertexShader:jt.meshmatcap_vert,fragmentShader:jt.meshmatcap_frag},points:{uniforms:ai([yt.points,yt.fog]),vertexShader:jt.points_vert,fragmentShader:jt.points_frag},dashed:{uniforms:ai([yt.common,yt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:jt.linedashed_vert,fragmentShader:jt.linedashed_frag},depth:{uniforms:ai([yt.common,yt.displacementmap]),vertexShader:jt.depth_vert,fragmentShader:jt.depth_frag},normal:{uniforms:ai([yt.common,yt.bumpmap,yt.normalmap,yt.displacementmap,{opacity:{value:1}}]),vertexShader:jt.meshnormal_vert,fragmentShader:jt.meshnormal_frag},sprite:{uniforms:ai([yt.sprite,yt.fog]),vertexShader:jt.sprite_vert,fragmentShader:jt.sprite_frag},background:{uniforms:{uvTransform:{value:new Zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:jt.background_vert,fragmentShader:jt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Zt}},vertexShader:jt.backgroundCube_vert,fragmentShader:jt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:jt.cube_vert,fragmentShader:jt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:jt.equirect_vert,fragmentShader:jt.equirect_frag},distance:{uniforms:ai([yt.common,yt.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:jt.distance_vert,fragmentShader:jt.distance_frag},shadow:{uniforms:ai([yt.lights,yt.fog,{color:{value:new at(0)},opacity:{value:1}}]),vertexShader:jt.shadow_vert,fragmentShader:jt.shadow_frag}};an.physical={uniforms:ai([an.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Zt},clearcoatNormalScale:{value:new q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Zt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Zt},sheen:{value:0},sheenColor:{value:new at(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Zt},transmissionSamplerSize:{value:new q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Zt},attenuationDistance:{value:0},attenuationColor:{value:new at(0)},specularColor:{value:new at(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Zt},anisotropyVector:{value:new q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Zt}}]),vertexShader:jt.meshphysical_vert,fragmentShader:jt.meshphysical_frag};var wu={r:0,b:0,g:0},SM=new Ht,a0=new Zt;a0.set(-1,0,0,0,1,0,0,0,1);function wM(s,t,e,i,n,r){let a=new at(0),o=n===!0?0:1,l,c,h=null,d=0,u=null;function f(y){let w=y.isScene===!0?y.background:null;if(w&&w.isTexture){let x=y.backgroundBlurriness>0;w=t.get(w,x)}return w}function p(y){let w=!1,x=f(y);x===null?g(a,o):x&&x.isColor&&(g(x,1),w=!0);let M=s.xr.getEnvironmentBlendMode();M==="additive"?e.buffers.color.setClear(0,0,0,1,r):M==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||w)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(y,w){let x=f(w);x&&(x.isCubeTexture||x.mapping===ir)?(c===void 0&&(c=new ee(new Ke(1,1,1),new Ce({name:"BackgroundCubeMaterial",uniforms:ar(an.backgroundCube.uniforms),vertexShader:an.backgroundCube.vertexShader,fragmentShader:an.backgroundCube.fragmentShader,side:ri,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(M,S,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=x,c.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(SM.makeRotationFromEuler(w.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(a0),c.material.toneMapped=te.getTransfer(x.colorSpace)!==le,(h!==x||d!==x.version||u!==s.toneMapping)&&(c.material.needsUpdate=!0,h=x,d=x.version,u=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):x&&x.isTexture&&(l===void 0&&(l=new ee(new Ci(2,2),new Ce({name:"BackgroundMaterial",uniforms:ar(an.background.uniforms),vertexShader:an.background.vertexShader,fragmentShader:an.background.fragmentShader,side:Un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.toneMapped=te.getTransfer(x.colorSpace)!==le,x.matrixAutoUpdate===!0&&x.updateMatrix(),l.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||u!==s.toneMapping)&&(l.material.needsUpdate=!0,h=x,d=x.version,u=s.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function g(y,w){y.getRGB(wu,Df(s)),e.buffers.color.setClear(wu.r,wu.g,wu.b,w,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,w=1){a.set(y),o=w,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(y){o=y,g(a,o)},render:p,addToRenderList:_,dispose:m}}function TM(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=u(null),r=n,a=!1;function o(I,F,B,D,z){let X=!1,W=d(I,D,B,F);r!==W&&(r=W,c(r.object)),X=f(I,D,B,z),X&&p(I,D,B,z),z!==null&&t.update(z,s.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,x(I,F,B,D),z!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(z).buffer))}function l(){return s.createVertexArray()}function c(I){return s.bindVertexArray(I)}function h(I){return s.deleteVertexArray(I)}function d(I,F,B,D){let z=D.wireframe===!0,X=i[F.id];X===void 0&&(X={},i[F.id]=X);let W=I.isInstancedMesh===!0?I.id:0,rt=X[W];rt===void 0&&(rt={},X[W]=rt);let Y=rt[B.id];Y===void 0&&(Y={},rt[B.id]=Y);let tt=Y[z];return tt===void 0&&(tt=u(l()),Y[z]=tt),tt}function u(I){let F=[],B=[],D=[];for(let z=0;z<e;z++)F[z]=0,B[z]=0,D[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:B,attributeDivisors:D,object:I,attributes:{},index:null}}function f(I,F,B,D){let z=r.attributes,X=F.attributes,W=0,rt=B.getAttributes();for(let Y in rt)if(rt[Y].location>=0){let nt=z[Y],Ut=X[Y];if(Ut===void 0&&(Y==="instanceMatrix"&&I.instanceMatrix&&(Ut=I.instanceMatrix),Y==="instanceColor"&&I.instanceColor&&(Ut=I.instanceColor)),nt===void 0||nt.attribute!==Ut||Ut&&nt.data!==Ut.data)return!0;W++}return r.attributesNum!==W||r.index!==D}function p(I,F,B,D){let z={},X=F.attributes,W=0,rt=B.getAttributes();for(let Y in rt)if(rt[Y].location>=0){let nt=X[Y];nt===void 0&&(Y==="instanceMatrix"&&I.instanceMatrix&&(nt=I.instanceMatrix),Y==="instanceColor"&&I.instanceColor&&(nt=I.instanceColor));let Ut={};Ut.attribute=nt,nt&&nt.data&&(Ut.data=nt.data),z[Y]=Ut,W++}r.attributes=z,r.attributesNum=W,r.index=D}function _(){let I=r.newAttributes;for(let F=0,B=I.length;F<B;F++)I[F]=0}function g(I){m(I,0)}function m(I,F){let B=r.newAttributes,D=r.enabledAttributes,z=r.attributeDivisors;B[I]=1,D[I]===0&&(s.enableVertexAttribArray(I),D[I]=1),z[I]!==F&&(s.vertexAttribDivisor(I,F),z[I]=F)}function y(){let I=r.newAttributes,F=r.enabledAttributes;for(let B=0,D=F.length;B<D;B++)F[B]!==I[B]&&(s.disableVertexAttribArray(B),F[B]=0)}function w(I,F,B,D,z,X,W){W===!0?s.vertexAttribIPointer(I,F,B,z,X):s.vertexAttribPointer(I,F,B,D,z,X)}function x(I,F,B,D){_();let z=D.attributes,X=B.getAttributes(),W=F.defaultAttributeValues;for(let rt in X){let Y=X[rt];if(Y.location>=0){let tt=z[rt];if(tt===void 0&&(rt==="instanceMatrix"&&I.instanceMatrix&&(tt=I.instanceMatrix),rt==="instanceColor"&&I.instanceColor&&(tt=I.instanceColor)),tt!==void 0){let nt=tt.normalized,Ut=tt.itemSize,Rt=t.get(tt);if(Rt===void 0)continue;let ue=Rt.buffer,ie=Rt.type,ae=Rt.bytesPerElement,J=ie===s.INT||ie===s.UNSIGNED_INT||tt.gpuType===ml;if(tt.isInterleavedBufferAttribute){let et=tt.data,bt=et.stride,Wt=tt.offset;if(et.isInstancedInterleavedBuffer){for(let Et=0;Et<Y.locationSize;Et++)m(Y.location+Et,et.meshPerAttribute);I.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let Et=0;Et<Y.locationSize;Et++)g(Y.location+Et);s.bindBuffer(s.ARRAY_BUFFER,ue);for(let Et=0;Et<Y.locationSize;Et++)w(Y.location+Et,Ut/Y.locationSize,ie,nt,bt*ae,(Wt+Ut/Y.locationSize*Et)*ae,J)}else{if(tt.isInstancedBufferAttribute){for(let et=0;et<Y.locationSize;et++)m(Y.location+et,tt.meshPerAttribute);I.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let et=0;et<Y.locationSize;et++)g(Y.location+et);s.bindBuffer(s.ARRAY_BUFFER,ue);for(let et=0;et<Y.locationSize;et++)w(Y.location+et,Ut/Y.locationSize,ie,nt,Ut*ae,Ut/Y.locationSize*et*ae,J)}}else if(W!==void 0){let nt=W[rt];if(nt!==void 0)switch(nt.length){case 2:s.vertexAttrib2fv(Y.location,nt);break;case 3:s.vertexAttrib3fv(Y.location,nt);break;case 4:s.vertexAttrib4fv(Y.location,nt);break;default:s.vertexAttrib1fv(Y.location,nt)}}}}y()}function M(){E();for(let I in i){let F=i[I];for(let B in F){let D=F[B];for(let z in D){let X=D[z];for(let W in X)h(X[W].object),delete X[W];delete D[z]}}delete i[I]}}function S(I){if(i[I.id]===void 0)return;let F=i[I.id];for(let B in F){let D=F[B];for(let z in D){let X=D[z];for(let W in X)h(X[W].object),delete X[W];delete D[z]}}delete i[I.id]}function A(I){for(let F in i){let B=i[F];for(let D in B){let z=B[D];if(z[I.id]===void 0)continue;let X=z[I.id];for(let W in X)h(X[W].object),delete X[W];delete z[I.id]}}}function v(I){for(let F in i){let B=i[F],D=I.isInstancedMesh===!0?I.id:0,z=B[D];if(z!==void 0){for(let X in z){let W=z[X];for(let rt in W)h(W[rt].object),delete W[rt];delete z[X]}delete B[D],Object.keys(B).length===0&&delete i[F]}}}function E(){P(),a=!0,r!==n&&(r=n,c(r.object))}function P(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:o,reset:E,resetDefaultState:P,dispose:M,releaseStatesOfGeometry:S,releaseStatesOfObject:v,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:g,disableUnusedAttributes:y}}function EM(s,t,e){let i;function n(l){i=l}function r(l,c){s.drawArrays(i,l,c),e.update(c,i,1)}function a(l,c,h){h!==0&&(s.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let f=0;f<h;f++)u+=c[f];e.update(u,i,1)}this.setMode=n,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function AM(s,t,e,i){let n;function r(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function a(A){return!(A!==si&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){let v=A===$e&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==pi&&A!==ni&&!v&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(pt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&pt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),p=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),y=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),w=s.getParameter(s.MAX_VARYING_VECTORS),x=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),M=s.getParameter(s.MAX_SAMPLES),S=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:p,maxTextureSize:_,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:y,maxVaryings:w,maxFragmentUniforms:x,maxSamples:M,samples:S}}function CM(s){let t=this,e=null,i=0,n=!1,r=!1,a=new _i,o=new Zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||i!==0||n;return n=u,i=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,f){let p=d.clippingPlanes,_=d.clipIntersection,g=d.clipShadows,m=s.get(d);if(!n||p===null||p.length===0||r&&!g)r?h(null):c();else{let y=r?0:i,w=y*4,x=m.clippingState||null;l.value=x,x=h(p,u,w,f);for(let M=0;M!==w;++M)x[M]=e[M];m.clippingState=x,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(d,u,f,p){let _=d!==null?d.length:0,g=null;if(_!==0){if(g=l.value,p!==!0||g===null){let m=f+_*4,y=u.matrixWorldInverse;o.getNormalMatrix(y),(g===null||g.length<m)&&(g=new Float32Array(m));for(let w=0,x=f;w!==_;++w,x+=4)a.copy(d[w]).applyMatrix4(y,o),a.normal.toArray(g,x),g[x+3]=a.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,g}}var Da=4,RM=6,PM=20,IM=256,ec=new Gi,Bg=new at,Of=null,Bf=0,zf=0,kf=!1,LM=new C,or=new C,sc=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,n=100,r={}){let{size:a=256,position:o=LM}=r;Of=this._renderer.getRenderTarget(),Bf=this._renderer.getActiveCubeFace(),zf=this._renderer.getActiveMipmapLevel(),kf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,n,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vg(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=kg(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Of,Bf,zf),this._renderer.xr.enabled=kf,t.scissorTest=!1,La(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===sn||t.mapping===On?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Of=this._renderer.getRenderTarget(),Bf=this._renderer.getActiveCubeFace(),zf=this._renderer.getActiveMipmapLevel(),kf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:Se,minFilter:Se,generateMipmaps:!1,type:$e,format:si,colorSpace:zr,depthBuffer:!1},n=zg(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=zg(t,e,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=DM(r)),this._blurMaterial=UM(r,t,e),this._ggxMaterial=NM(r,t,e)}return n}_compileMaterial(t){let e=new ee(new kt,t);this._renderer.compile(e,ec)}_sceneToCubeUV(t,e,i,n,r){let l=new ze(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Bg),d.toneMapping=Wi,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(n),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ee(new Ke,new ce({name:"PMREM.Background",side:ri,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,g=_.material,m=!1,y=t.background;y?y.isColor&&(g.color.copy(y),t.background=null,m=!0):(g.color.copy(Bg),m=!0);for(let w=0;w<6;w++){let x=w%3;x===0?(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[w],r.y,r.z)):x===1?(l.up.set(0,0,c[w]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[w],r.z)):(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[w]));let M=this._cubeSize;La(n,x*M,w>2?M:0,M,M),d.setRenderTarget(n),m&&d.render(_,l),d.render(t,l)}d.toneMapping=f,d.autoClear=u,t.background=y}_textureToCubeUV(t,e){let i=this._renderer,n=t.mapping===sn||t.mapping===On;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vg()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=kg());let r=n?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;La(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(a,ec)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let n=this._lodMeshes.length;for(let r=1;r<n;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=i}_applyGGXFilter(t,e,i){let n=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let l=a.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,f=d*u,{_lodMax:p}=this,_=this._sizeLods[i],g=3*_*(i>p-Da?i-p+Da:0),m=4*(this._cubeSize-_);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=p-e,La(r,g,m,3*_,2*_),n.setRenderTarget(r),n.render(o,ec),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=p-i,La(t,g,m,3*_,2*_),n.setRenderTarget(t),n.render(o,ec)}_blur(t,e,i,n){let r=this._pingPongRenderTarget,a=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,i,a),this._blurPass(r,t,i,i,a)}_blurPass(t,e,i,n,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[n];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],d=3*h*(n>this._lodMax-Da?n-this._lodMax+Da:0),u=4*(this._cubeSize-h);La(e,d,u,3*h,2*h),a.setRenderTarget(e),a.render(l,ec)}};function DM(s){let t=[],e=[],i=s,n=s-Da+1+RM;for(let r=0;r<n;r++){let a=Math.pow(2,i);t.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,f=3,p=new Float32Array(f*u*d),_=new Float32Array(f*u*d);for(let m=0;m<d;m++){let y=m%3*2/3-1,w=m>2?0:-1,x=[y,w,0,y+2/3,w,0,y+2/3,w+1,0,y,w,0,y+2/3,w+1,0,y,w+1,0];p.set(x,f*u*m);for(let M=0;M<u;M++){let S=h[M*2]*2-1,A=h[M*2+1]*2-1;m===0?or.set(1,A,S):m===1?or.set(-S,1,-A):m===2?or.set(-S,A,1):m===3?or.set(-1,A,-S):m===4?or.set(-S,-1,A):or.set(S,A,-1),or.toArray(_,(m*u+M)*f)}}let g=new kt;g.setAttribute("position",new he(p,f)),g.setAttribute("outputDirection",new he(_,f)),e.push(new ee(g,null)),i>Da&&i--}return{lodMeshes:e,sizeLods:t}}function zg(s,t,e){let i=new Ae(s,t,e);return i.texture.mapping=ir,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function La(s,t,e,i,n){s.viewport.set(t,e,i,n),s.scissor.set(t,e,i,n)}function NM(s,t,e){return new Ce({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:IM,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Eu(),fragmentShader:`

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
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function UM(s,t,e){return new Ce({name:"SphericalGaussianBlur",defines:{SAMPLES:PM,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Eu(),fragmentShader:`

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
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function kg(){return new Ce({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Eu(),fragmentShader:`

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
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function Vg(){return new Ce({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Eu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function Eu(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var rc=class extends Ae{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new ns(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new Ke(5,5,5),r=new Ce({name:"CubemapFromEquirect",uniforms:ar(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:ri,blending:Ri});r.uniforms.tEquirect.value=e;let a=new ee(n,r),o=e.minFilter;return e.minFilter===rn&&(e.minFilter=Se),new ll(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,n);t.setRenderTarget(r)}};function FM(s){let t=new WeakMap,e=new WeakMap,i=null;function n(u,f=!1){return u==null?null:f?a(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===Ma||f===ba)if(t.has(u)){let p=t.get(u).texture;return o(p,u.mapping)}else{let p=u.image;if(p&&p.height>0){let _=new rc(p.height);return _.fromEquirectangularTexture(s,u),t.set(u,_),u.addEventListener("dispose",c),o(_.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let f=u.mapping,p=f===Ma||f===ba,_=f===sn||f===On;if(p||_){let g=e.get(u),m=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return i===null&&(i=new sc(s)),g=p?i.fromEquirectangular(u,g):i.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,e.set(u,g),g.texture;if(g!==void 0)return g.texture;{let y=u.image;return p&&y&&y.height>0||_&&y&&l(y)?(i===null&&(i=new sc(s)),g=p?i.fromEquirectangular(u):i.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,e.set(u,g),u.addEventListener("dispose",h),g.texture):null}}}return u}function o(u,f){return f===Ma?u.mapping=sn:f===ba&&(u.mapping=On),u}function l(u){let f=0,p=6;for(let _=0;_<p;_++)u[_]!==void 0&&f++;return f===p}function c(u){let f=u.target;f.removeEventListener("dispose",c);let p=t.get(f);p!==void 0&&(t.delete(f),p.dispose())}function h(u){let f=u.target;f.removeEventListener("dispose",h);let p=e.get(f);p!==void 0&&(e.delete(f),p.dispose())}function d(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:d}}function OM(s){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=s.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&un("WebGLRenderer: "+i+" extension not supported."),n}}}function BM(s,t,e,i){let n={},r=new WeakMap;function a(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let p in u.attributes)t.remove(u.attributes[p]);u.removeEventListener("dispose",a),delete n[u.id];let f=r.get(u);f&&(t.remove(f),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(d,u){return n[u.id]===!0||(u.addEventListener("dispose",a),n[u.id]=!0,e.memory.geometries++),u}function l(d){let u=d.attributes;for(let f in u)t.update(u[f],s.ARRAY_BUFFER)}function c(d){let u=[],f=d.index,p=d.attributes.position,_=0;if(p===void 0)return;if(f!==null){let y=f.array;_=f.version;for(let w=0,x=y.length;w<x;w+=3){let M=y[w+0],S=y[w+1],A=y[w+2];u.push(M,S,S,A,A,M)}}else{let y=p.array;_=p.version;for(let w=0,x=y.length/3-1;w<x;w+=3){let M=w+0,S=w+1,A=w+2;u.push(M,S,S,A,A,M)}}let g=new(p.count>=65535?Xr:Wr)(u,1);g.version=_;let m=r.get(d);m&&t.remove(m),r.set(d,g)}function h(d){let u=r.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function zM(s,t,e){let i;function n(d){i=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,u){s.drawElements(i,u,r,d*a),e.update(u,i,1)}function c(d,u,f){f!==0&&(s.drawElementsInstanced(i,u,r,d*a,f),e.update(u,i,f))}function h(d,u,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,d,0,f);let _=0;for(let g=0;g<f;g++)_+=u[g];e.update(_,i,1)}this.setMode=n,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function kM(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:Dt("WebGLInfo: Unknown draw mode:",a);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function VM(s,t,e){let i=new WeakMap,n=new ge;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==d){let E=function(){A.dispose(),i.delete(o),o.removeEventListener("dispose",E)};u!==void 0&&u.texture.dispose();let f=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],y=o.morphAttributes.color||[],w=0;f===!0&&(w=1),p===!0&&(w=2),_===!0&&(w=3);let x=o.attributes.position.count*w,M=1;x>t.maxTextureSize&&(M=Math.ceil(x/t.maxTextureSize),x=t.maxTextureSize);let S=new Float32Array(x*M*4*d),A=new Ls(S,x,M,d);A.type=ni,A.needsUpdate=!0;let v=w*4;for(let P=0;P<d;P++){let I=g[P],F=m[P],B=y[P],D=x*M*4*P;for(let z=0;z<I.count;z++){let X=z*v;f===!0&&(n.fromBufferAttribute(I,z),S[D+X+0]=n.x,S[D+X+1]=n.y,S[D+X+2]=n.z,S[D+X+3]=0),p===!0&&(n.fromBufferAttribute(F,z),S[D+X+4]=n.x,S[D+X+5]=n.y,S[D+X+6]=n.z,S[D+X+7]=0),_===!0&&(n.fromBufferAttribute(B,z),S[D+X+8]=n.x,S[D+X+9]=n.y,S[D+X+10]=n.z,S[D+X+11]=B.itemSize===4?n.w:1)}}u={count:d,texture:A,size:new q(x,M)},i.set(o,u),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let p=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",p),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",u.size)}return{update:r}}function GM(s,t,e,i,n){let r=new WeakMap;function a(c){let h=n.render.frame,d=c.geometry,u=t.get(c,d);if(r.get(u)!==h&&(t.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:a,dispose:o}}var HM={[ma]:"LINEAR_TONE_MAPPING",[ga]:"REINHARD_TONE_MAPPING",[_a]:"CINEON_TONE_MAPPING",[hs]:"ACES_FILMIC_TONE_MAPPING",[va]:"AGX_TONE_MAPPING",[ya]:"NEUTRAL_TONE_MAPPING",[xa]:"CUSTOM_TONE_MAPPING"};function WM(s,t,e,i,n,r){let a=new Ae(t,e,{type:s,depthBuffer:n,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new kt;c.setAttribute("position",new vt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new vt([0,2,0,0,2,0],2));let h=new as({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new ee(c,h),u=new Gi(-1,1,1,-1,0,1),f=null,p=null,_=!1,g,m=null,y=[],w=!1;this.setSize=function(x,M){a.setSize(x,M),o!==null&&o.setSize(x,M),l!==null&&l.setSize(x,M);for(let S=0;S<y.length;S++){let A=y[S];A.setSize&&A.setSize(x,M)}},this.setEffects=function(x){y=x,w=y.length>0&&y[0].isRenderPass===!0;let M=a.width,S=a.height;y.length>0&&o===null&&(o=new Ae(M,S,{type:$e,depthBuffer:!1,stencilBuffer:!1}),l=new Ae(M,S,{type:$e,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<y.length;A++){let v=y[A];v.setSize&&v.setSize(M,S)}},this.begin=function(x,M){if(_||x.toneMapping===Wi&&y.length===0)return!1;if(m=M,M!==null){let S=M.width,A=M.height;(a.width!==S||a.height!==A)&&this.setSize(S,A)}return w===!1&&x.setRenderTarget(a),g=x.toneMapping,x.toneMapping=Wi,!0},this.hasRenderPass=function(){return w},this.end=function(x,M){x.toneMapping=g,_=!0;let S=a,A=o;for(let v=0;v<y.length;v++){let E=y[v];E.enabled!==!1&&(E.render(x,A,S,M),E.needsSwap!==!1&&(S=A,A=A===o?l:o))}if(f!==x.outputColorSpace||p!==x.toneMapping){f=x.outputColorSpace,p=x.toneMapping,h.defines={},te.getTransfer(f)===le&&(h.defines.SRGB_TRANSFER="");let v=HM[p];v&&(h.defines[v]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=S.texture,x.setRenderTarget(m),x.render(d,u),m=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var o0=new Le,Hf=new Ln(1,1),l0=new Ls,c0=new Ds,h0=new ns,Gg=[],Hg=[],Wg=new Float32Array(16),Xg=new Float32Array(9),qg=new Float32Array(4);function Ua(s,t,e){let i=s[0];if(i<=0||i>0)return s;let n=t*e,r=Gg[n];if(r===void 0&&(r=new Float32Array(n),Gg[n]=r),t!==0){i.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function We(s,t){if(s.length!==t.length)return!1;for(let e=0,i=s.length;e<i;e++)if(s[e]!==t[e])return!1;return!0}function Xe(s,t){for(let e=0,i=t.length;e<i;e++)s[e]=t[e]}function Au(s,t){let e=Hg[t];e===void 0&&(e=new Int32Array(t),Hg[t]=e);for(let i=0;i!==t;++i)e[i]=s.allocateTextureUnit();return e}function XM(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function qM(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(We(e,t))return;s.uniform2fv(this.addr,t),Xe(e,t)}}function YM(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(We(e,t))return;s.uniform3fv(this.addr,t),Xe(e,t)}}function ZM(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(We(e,t))return;s.uniform4fv(this.addr,t),Xe(e,t)}}function $M(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(We(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Xe(e,t)}else{if(We(e,i))return;qg.set(i),s.uniformMatrix2fv(this.addr,!1,qg),Xe(e,i)}}function JM(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(We(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Xe(e,t)}else{if(We(e,i))return;Xg.set(i),s.uniformMatrix3fv(this.addr,!1,Xg),Xe(e,i)}}function KM(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(We(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Xe(e,t)}else{if(We(e,i))return;Wg.set(i),s.uniformMatrix4fv(this.addr,!1,Wg),Xe(e,i)}}function jM(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function QM(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(We(e,t))return;s.uniform2iv(this.addr,t),Xe(e,t)}}function tb(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(We(e,t))return;s.uniform3iv(this.addr,t),Xe(e,t)}}function eb(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(We(e,t))return;s.uniform4iv(this.addr,t),Xe(e,t)}}function ib(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function nb(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(We(e,t))return;s.uniform2uiv(this.addr,t),Xe(e,t)}}function sb(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(We(e,t))return;s.uniform3uiv(this.addr,t),Xe(e,t)}}function rb(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(We(e,t))return;s.uniform4uiv(this.addr,t),Xe(e,t)}}function ab(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(Hf.compareFunction=e.isReversedDepthBuffer()?Ql:jl,r=Hf):r=o0,e.setTexture2D(t||r,n)}function ob(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||c0,n)}function lb(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||h0,n)}function cb(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||l0,n)}function hb(s){switch(s){case 5126:return XM;case 35664:return qM;case 35665:return YM;case 35666:return ZM;case 35674:return $M;case 35675:return JM;case 35676:return KM;case 5124:case 35670:return jM;case 35667:case 35671:return QM;case 35668:case 35672:return tb;case 35669:case 35673:return eb;case 5125:return ib;case 36294:return nb;case 36295:return sb;case 36296:return rb;case 35678:case 36198:case 36298:case 36306:case 35682:return ab;case 35679:case 36299:case 36307:return ob;case 35680:case 36300:case 36308:case 36293:return lb;case 36289:case 36303:case 36311:case 36292:return cb}}function ub(s,t){s.uniform1fv(this.addr,t)}function db(s,t){let e=Ua(t,this.size,2);s.uniform2fv(this.addr,e)}function fb(s,t){let e=Ua(t,this.size,3);s.uniform3fv(this.addr,e)}function pb(s,t){let e=Ua(t,this.size,4);s.uniform4fv(this.addr,e)}function mb(s,t){let e=Ua(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function gb(s,t){let e=Ua(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function _b(s,t){let e=Ua(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function xb(s,t){s.uniform1iv(this.addr,t)}function vb(s,t){s.uniform2iv(this.addr,t)}function yb(s,t){s.uniform3iv(this.addr,t)}function Mb(s,t){s.uniform4iv(this.addr,t)}function bb(s,t){s.uniform1uiv(this.addr,t)}function Sb(s,t){s.uniform2uiv(this.addr,t)}function wb(s,t){s.uniform3uiv(this.addr,t)}function Tb(s,t){s.uniform4uiv(this.addr,t)}function Eb(s,t,e){let i=this.cache,n=t.length,r=Au(e,n);We(i,r)||(s.uniform1iv(this.addr,r),Xe(i,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=Hf:a=o0;for(let o=0;o!==n;++o)e.setTexture2D(t[o]||a,r[o])}function Ab(s,t,e){let i=this.cache,n=t.length,r=Au(e,n);We(i,r)||(s.uniform1iv(this.addr,r),Xe(i,r));for(let a=0;a!==n;++a)e.setTexture3D(t[a]||c0,r[a])}function Cb(s,t,e){let i=this.cache,n=t.length,r=Au(e,n);We(i,r)||(s.uniform1iv(this.addr,r),Xe(i,r));for(let a=0;a!==n;++a)e.setTextureCube(t[a]||h0,r[a])}function Rb(s,t,e){let i=this.cache,n=t.length,r=Au(e,n);We(i,r)||(s.uniform1iv(this.addr,r),Xe(i,r));for(let a=0;a!==n;++a)e.setTexture2DArray(t[a]||l0,r[a])}function Pb(s){switch(s){case 5126:return ub;case 35664:return db;case 35665:return fb;case 35666:return pb;case 35674:return mb;case 35675:return gb;case 35676:return _b;case 5124:case 35670:return xb;case 35667:case 35671:return vb;case 35668:case 35672:return yb;case 35669:case 35673:return Mb;case 5125:return bb;case 36294:return Sb;case 36295:return wb;case 36296:return Tb;case 35678:case 36198:case 36298:case 36306:case 35682:return Eb;case 35679:case 36299:case 36307:return Ab;case 35680:case 36300:case 36308:case 36293:return Cb;case 36289:case 36303:case 36311:case 36292:return Rb}}var Wf=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=hb(e.type)}},Xf=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Pb(e.type)}},qf=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let r=0,a=n.length;r!==a;++r){let o=n[r];o.setValue(t,e[o.id],i)}}},Vf=/(\w+)(\])?(\[|\.)?/g;function Yg(s,t){s.seq.push(t),s.map[t.id]=t}function Ib(s,t,e){let i=s.name,n=i.length;for(Vf.lastIndex=0;;){let r=Vf.exec(i),a=Vf.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===n){Yg(e,c===void 0?new Wf(o,s,t):new Xf(o,s,t));break}else{let d=e.map[o];d===void 0&&(d=new qf(o),Yg(e,d)),e=d}}}var Na=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);Ib(o,l,this)}let n=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(a):r.push(a);n.length>0&&(this.seq=n.concat(r))}setValue(t,e,i,n){let r=this.map[e];r!==void 0&&r.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,r=t.length;n!==r;++n){let a=t[n];a.id in e&&i.push(a)}return i}};function Zg(s,t,e){let i=s.createShader(t);return s.shaderSource(i,e),s.compileShader(i),i}var Lb=37297,Db=0;function Nb(s,t){let e=s.split(`
`),i=[],n=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=n;a<r;a++){let o=a+1;i.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return i.join(`
`)}var $g=new Zt;function Ub(s){te._getMatrix($g,te.workingColorSpace,s);let t=`mat3( ${$g.elements.map(e=>e.toFixed(4))} )`;switch(te.getTransfer(s)){case kr:return[t,"LinearTransferOETF"];case le:return[t,"sRGBTransferOETF"];default:return pt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function Jg(s,t,e){let i=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Nb(s.getShaderSource(t),o)}else return r}function Fb(s,t){let e=Ub(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var Ob={[ma]:"Linear",[ga]:"Reinhard",[_a]:"Cineon",[hs]:"ACESFilmic",[va]:"AgX",[ya]:"Neutral",[xa]:"Custom"};function Bb(s,t){let e=Ob[t];return e===void 0?(pt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Tu=new C;function zb(){te.getLuminanceCoefficients(Tu);let s=Tu.x.toFixed(4),t=Tu.y.toFixed(4),e=Tu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function kb(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(nc).join(`
`)}function Vb(s){let t=[];for(let e in s){let i=s[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function Gb(s,t){let e={},i=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let r=s.getActiveAttrib(t,n),a=r.name,o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function nc(s){return s!==""}function Kg(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function jg(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Hb=/^[ \t]*#include +<([\w\d./]+)>/gm;function Yf(s){return s.replace(Hb,Xb)}var Wb=new Map;function Xb(s,t){let e=jt[t];if(e===void 0){let i=Wb.get(t);if(i!==void 0)e=jt[i],pt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Yf(e)}var qb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Qg(s){return s.replace(qb,Yb)}function Yb(s,t,e,i){let n="";for(let r=parseInt(t);r<parseInt(e);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function t0(s){let t=`precision ${s.precision} float;
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
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var Zb={[fa]:"SHADOWMAP_TYPE_PCF",[tr]:"SHADOWMAP_TYPE_VSM"};function $b(s){return Zb[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Jb={[sn]:"ENVMAP_TYPE_CUBE",[On]:"ENVMAP_TYPE_CUBE",[ir]:"ENVMAP_TYPE_CUBE_UV"};function Kb(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":Jb[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var jb={[On]:"ENVMAP_MODE_REFRACTION"};function Qb(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":jb[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var tS={[pa]:"ENVMAP_BLENDING_MULTIPLY",[mf]:"ENVMAP_BLENDING_MIX",[gf]:"ENVMAP_BLENDING_ADD"};function eS(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":tS[s.combine]||"ENVMAP_BLENDING_NONE"}function iS(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function nS(s,t,e,i){let n=s.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=$b(e),c=Kb(e),h=Qb(e),d=eS(e),u=iS(e),f=kb(e),p=Vb(r),_=n.createProgram(),g,m,y=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(nc).join(`
`),g.length>0&&(g+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(nc).join(`
`),m.length>0&&(m+=`
`)):(g=[t0(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(nc).join(`
`),m=[t0(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Wi?"#define TONE_MAPPING":"",e.toneMapping!==Wi?jt.tonemapping_pars_fragment:"",e.toneMapping!==Wi?Bb("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",jt.colorspace_pars_fragment,Fb("linearToOutputTexel",e.outputColorSpace),zb(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(nc).join(`
`)),a=Yf(a),a=Kg(a,e),a=jg(a,e),o=Yf(o),o=Kg(o,e),o=jg(o,e),a=Qg(a),o=Qg(o),e.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,m=["#define varying in",e.glslVersion===bu?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===bu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let w=y+g+a,x=y+m+o,M=Zg(n,n.VERTEX_SHADER,w),S=Zg(n,n.FRAGMENT_SHADER,x);n.attachShader(_,M),n.attachShader(_,S),e.index0AttributeName!==void 0?n.bindAttribLocation(_,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(_,0,"position"),n.linkProgram(_);function A(I){if(s.debug.checkShaderErrors){let F=n.getProgramInfoLog(_)||"",B=n.getShaderInfoLog(M)||"",D=n.getShaderInfoLog(S)||"",z=F.trim(),X=B.trim(),W=D.trim(),rt=!0,Y=!0;if(n.getProgramParameter(_,n.LINK_STATUS)===!1)if(rt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,_,M,S);else{let tt=Jg(n,M,"vertex"),nt=Jg(n,S,"fragment");Dt("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(_,n.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+z+`
`+tt+`
`+nt)}else z!==""?pt("WebGLProgram: Program Info Log:",z):(X===""||W==="")&&(Y=!1);Y&&(I.diagnostics={runnable:rt,programLog:z,vertexShader:{log:X,prefix:g},fragmentShader:{log:W,prefix:m}})}n.deleteShader(M),n.deleteShader(S),v=new Na(n,_),E=Gb(n,_)}let v;this.getUniforms=function(){return v===void 0&&A(this),v};let E;this.getAttributes=function(){return E===void 0&&A(this),E};let P=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=n.getProgramParameter(_,Lb)),P},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Db++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=M,this.fragmentShader=S,this}var sS=0,Zf=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new $f(t),e.set(t,i)),i}},$f=class{constructor(t){this.id=sS++,this.code=t,this.usedTimes=0}};function rS(s){return s===zn||s===Ra||s===Pa}function aS(s,t,e,i,n,r){let a=new Ns,o=new Zf,l=new Set,c=[],h=new Map,d=i.logarithmicDepthBuffer,u=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(v){return l.add(v),v===0?"uv":`uv${v}`}function _(v,E,P,I,F,B){let D=I.fog,z=F.geometry,X=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?I.environment:null,W=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,rt=t.get(v.envMap||X,W),Y=rt&&rt.mapping===ir?rt.image.height:null,tt=f[v.type];v.precision!==null&&(u=i.getMaxPrecision(v.precision),u!==v.precision&&pt("WebGLProgram.getParameters:",v.precision,"not supported, using",u,"instead."));let nt=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Ut=nt!==void 0?nt.length:0,Rt=0;z.morphAttributes.position!==void 0&&(Rt=1),z.morphAttributes.normal!==void 0&&(Rt=2),z.morphAttributes.color!==void 0&&(Rt=3);let ue,ie,ae,J;if(tt){let Me=an[tt];ue=Me.vertexShader,ie=Me.fragmentShader}else{ue=v.vertexShader,ie=v.fragmentShader;let Me=o.getVertexShaderStage(v),fe=o.getFragmentShaderStage(v);o.update(v,Me,fe),ae=Me.id,J=fe.id}let et=s.getRenderTarget(),bt=s.state.buffers.depth.getReversed(),Wt=F.isInstancedMesh===!0,Et=F.isBatchedMesh===!0,qt=!!v.map,_e=!!v.matcap,it=!!rt,ot=!!v.aoMap,lt=!!v.lightMap,ct=!!v.bumpMap&&v.wireframe===!1,ft=!!v.normalMap,Vt=!!v.displacementMap,zt=!!v.emissiveMap,Yt=!!v.metalnessMap,$t=!!v.roughnessMap,L=v.anisotropy>0,de=v.clearcoat>0,ne=v.dispersion>0,R=v.retroreflectivity>0,b=v.iridescence>0,O=v.sheen>0,G=v.transmission>0,Z=L&&!!v.anisotropyMap,ht=de&&!!v.clearcoatMap,dt=de&&!!v.clearcoatNormalMap,$=de&&!!v.clearcoatRoughnessMap,Q=b&&!!v.iridescenceMap,mt=b&&!!v.iridescenceThicknessMap,Ft=O&&!!v.sheenColorMap,Mt=O&&!!v.sheenRoughnessMap,gt=!!v.specularMap,Ot=!!v.specularColorMap,Gt=!!v.specularIntensityMap,Jt=G&&!!v.transmissionMap,U=G&&!!v.thicknessMap,_t=!!v.gradientMap,K=!!v.alphaMap,xt=v.alphaTest>0,Tt=!!v.alphaHash,st=!!v.extensions,Bt=Wi;v.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(Bt=s.toneMapping);let Lt={shaderID:tt,shaderType:v.type,shaderName:v.name,vertexShader:ue,fragmentShader:ie,defines:v.defines,customVertexShaderID:ae,customFragmentShaderID:J,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:u,batching:Et,batchingColor:Et&&F._colorsTexture!==null,instancing:Wt,instancingColor:Wt&&F.instanceColor!==null,instancingMorph:Wt&&F.morphTexture!==null,outputColorSpace:et===null?s.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:te.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:qt,matcap:_e,envMap:it,envMapMode:it&&rt.mapping,envMapCubeUVHeight:Y,aoMap:ot,lightMap:lt,bumpMap:ct,normalMap:ft,displacementMap:Vt,emissiveMap:zt,normalMapObjectSpace:ft&&v.normalMapType===bf,normalMapTangentSpace:ft&&v.normalMapType===xn,packedNormalMap:ft&&v.normalMapType===xn&&rS(v.normalMap.format),metalnessMap:Yt,roughnessMap:$t,anisotropy:L,anisotropyMap:Z,clearcoat:de,clearcoatMap:ht,clearcoatNormalMap:dt,clearcoatRoughnessMap:$,dispersion:ne,retroreflection:R,iridescence:b,iridescenceMap:Q,iridescenceThicknessMap:mt,sheen:O,sheenColorMap:Ft,sheenRoughnessMap:Mt,specularMap:gt,specularColorMap:Ot,specularIntensityMap:Gt,transmission:G,transmissionMap:Jt,thicknessMap:U,gradientMap:_t,opaque:v.transparent===!1&&v.blending===er&&v.alphaToCoverage===!1,alphaMap:K,alphaTest:xt,alphaHash:Tt,combine:v.combine,mapUv:qt&&p(v.map.channel),aoMapUv:ot&&p(v.aoMap.channel),lightMapUv:lt&&p(v.lightMap.channel),bumpMapUv:ct&&p(v.bumpMap.channel),normalMapUv:ft&&p(v.normalMap.channel),displacementMapUv:Vt&&p(v.displacementMap.channel),emissiveMapUv:zt&&p(v.emissiveMap.channel),metalnessMapUv:Yt&&p(v.metalnessMap.channel),roughnessMapUv:$t&&p(v.roughnessMap.channel),anisotropyMapUv:Z&&p(v.anisotropyMap.channel),clearcoatMapUv:ht&&p(v.clearcoatMap.channel),clearcoatNormalMapUv:dt&&p(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:$&&p(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&p(v.iridescenceMap.channel),iridescenceThicknessMapUv:mt&&p(v.iridescenceThicknessMap.channel),sheenColorMapUv:Ft&&p(v.sheenColorMap.channel),sheenRoughnessMapUv:Mt&&p(v.sheenRoughnessMap.channel),specularMapUv:gt&&p(v.specularMap.channel),specularColorMapUv:Ot&&p(v.specularColorMap.channel),specularIntensityMapUv:Gt&&p(v.specularIntensityMap.channel),transmissionMapUv:Jt&&p(v.transmissionMap.channel),thicknessMapUv:U&&p(v.thicknessMap.channel),alphaMapUv:K&&p(v.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(ft||L),vertexNormals:!!z.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!z.attributes.uv&&(qt||K),fog:!!D,useFog:v.fog===!0,fogExp2:!!D&&D.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||z.attributes.normal===void 0&&ft===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:bt,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:z.attributes.position!==void 0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Ut,morphTextureStride:Rt,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:B.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:Bt,decodeVideoTexture:qt&&v.map.isVideoTexture===!0&&te.getTransfer(v.map.colorSpace)===le,decodeVideoTextureEmissive:zt&&v.emissiveMap.isVideoTexture===!0&&te.getTransfer(v.emissiveMap.colorSpace)===le,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===fi,flipSided:v.side===ri,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:st&&v.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(st&&v.extensions.multiDraw===!0||Et)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Lt.vertexUv1s=l.has(1),Lt.vertexUv2s=l.has(2),Lt.vertexUv3s=l.has(3),l.clear(),Lt}function g(v){let E=[];if(v.shaderID?E.push(v.shaderID):(E.push(v.customVertexShaderID),E.push(v.customFragmentShaderID)),v.defines!==void 0)for(let P in v.defines)E.push(P),E.push(v.defines[P]);return v.isRawShaderMaterial===!1&&(m(E,v),y(E,v),E.push(s.outputColorSpace)),E.push(v.customProgramCacheKey),E.join()}function m(v,E){v.push(E.precision),v.push(E.outputColorSpace),v.push(E.envMapMode),v.push(E.envMapCubeUVHeight),v.push(E.mapUv),v.push(E.alphaMapUv),v.push(E.lightMapUv),v.push(E.aoMapUv),v.push(E.bumpMapUv),v.push(E.normalMapUv),v.push(E.displacementMapUv),v.push(E.emissiveMapUv),v.push(E.metalnessMapUv),v.push(E.roughnessMapUv),v.push(E.anisotropyMapUv),v.push(E.clearcoatMapUv),v.push(E.clearcoatNormalMapUv),v.push(E.clearcoatRoughnessMapUv),v.push(E.iridescenceMapUv),v.push(E.iridescenceThicknessMapUv),v.push(E.sheenColorMapUv),v.push(E.sheenRoughnessMapUv),v.push(E.specularMapUv),v.push(E.specularColorMapUv),v.push(E.specularIntensityMapUv),v.push(E.transmissionMapUv),v.push(E.thicknessMapUv),v.push(E.combine),v.push(E.fogExp2),v.push(E.sizeAttenuation),v.push(E.morphTargetsCount),v.push(E.morphAttributeCount),v.push(E.numSunLights),v.push(E.numDirLights),v.push(E.numPointLights),v.push(E.numSpotLights),v.push(E.numSpotLightMaps),v.push(E.numHemiLights),v.push(E.numRectAreaLights),v.push(E.numSunLightShadows),v.push(E.numDirLightShadows),v.push(E.numPointLightShadows),v.push(E.numSpotLightShadows),v.push(E.numSpotLightShadowsWithMaps),v.push(E.numLightProbes),v.push(E.shadowMapType),v.push(E.toneMapping),v.push(E.numClippingPlanes),v.push(E.numClipIntersection),v.push(E.depthPacking)}function y(v,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.retroreflection&&a.enable(24),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),E.packedNormalMap&&a.enable(22),E.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),E.numLightProbeGrids>0&&a.enable(22),E.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function w(v){let E=f[v.type],P;if(E){let I=an[E];P=yn.clone(I.uniforms)}else P=v.uniforms;return P}function x(v,E){let P=h.get(E);return P!==void 0?++P.usedTimes:(P=new nS(s,E,v,n),c.push(P),h.set(E,P)),P}function M(v){if(--v.usedTimes===0){let E=c.indexOf(v);c[E]=c[c.length-1],c.pop(),h.delete(v.cacheKey),v.destroy()}}function S(v){o.remove(v)}function A(){o.dispose()}return{getParameters:_,getProgramCacheKey:g,getUniforms:w,acquireProgram:x,releaseProgram:M,releaseShaderCache:S,programs:c,dispose:A}}function oS(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function i(a){s.delete(a)}function n(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:r}}function lS(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function e0(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function i0(){let s=[],t=0,e=[],i=[],n=[];function r(){t=0,e.length=0,i.length=0,n.length=0}function a(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,p,_,g,m){let y=s[t];return y===void 0?(y={id:u.id,object:u,geometry:f,material:p,materialVariant:a(u),groupOrder:_,renderOrder:u.renderOrder,z:g,group:m},s[t]=y):(y.id=u.id,y.object=u,y.geometry=f,y.material=p,y.materialVariant=a(u),y.groupOrder=_,y.renderOrder=u.renderOrder,y.z=g,y.group=m),t++,y}function l(u,f,p,_,g,m,y){y.reversedDepth===!0&&(g=-g);let w=o(u,f,p,_,g,m);p.transmission>0?i.push(w):p.transparent===!0?n.push(w):e.push(w)}function c(u,f,p,_,g,m){let y=o(u,f,p,_,g,m);p.transmission>0?i.unshift(y):p.transparent===!0?n.unshift(y):e.unshift(y)}function h(u,f){e.length>1&&e.sort(u||lS),i.length>1&&i.sort(f||e0),n.length>1&&n.sort(f||e0)}function d(){for(let u=t,f=s.length;u<f;u++){let p=s[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:i,transparent:n,init:r,push:l,unshift:c,finish:d,sort:h}}function cS(){let s=new WeakMap;function t(i,n){let r=s.get(i),a;return r===void 0?(a=new i0,s.set(i,[a])):n>=r.length?(a=new i0,r.push(a)):a=r[n],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function hS(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new C,color:new at};break;case"SpotLight":e={position:new C,direction:new C,color:new at,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new C,color:new at,distance:0,decay:0};break;case"HemisphereLight":e={direction:new C,skyColor:new at,groundColor:new at};break;case"RectAreaLight":e={color:new at,position:new C,halfWidth:new C,halfHeight:new C};break}return s[t.id]=e,e}}}function uS(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var dS=0;function fS(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function pS(s){let t=new hS,e=uS(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new C);let n=new C,r=new Ht,a=new Ht;function o(c){let h=0,d=0,u=0;for(let F=0;F<9;F++)i.probe[F].set(0,0,0);let f=0,p=0,_=0,g=0,m=0,y=0,w=0,x=0,M=0,S=0,A=0,v=0,E=0,P=0;c.sort(fS);for(let F=0,B=c.length;F<B;F++){let D=c[F],z=D.color,X=D.intensity,W=D.distance,rt=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===zn?rt=D.shadow.map.texture:rt=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)h+=z.r*X,d+=z.g*X,u+=z.b*X;else if(D.isLightProbe){for(let Y=0;Y<9;Y++)i.probe[Y].addScaledVector(D.sh.coefficients[Y],X);P++}else if(D.isSunLight){let Y=t.get(D);if(Y.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let tt=D.shadow,nt=e.get(D);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize.copy(tt.mapSize).multiply(tt.getFrameExtents()),i.sunShadow[p]=nt,i.sunShadowMap[p]=rt;let Ut=tt.getViewportCount();for(let Rt=0;Rt<Ut;Rt++)i.sunShadowMatrix[_+Rt]=tt.getMatrix(Rt),i.sunShadowCascade[_+Rt]=tt._cascadeData[Rt];_+=Ut,p++}i.sun[f]=Y,f++}else if(D.isDirectionalLight){let Y=t.get(D);if(Y.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let tt=D.shadow,nt=e.get(D);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,i.directionalShadow[g]=nt,i.directionalShadowMap[g]=rt,i.directionalShadowMatrix[g]=D.shadow.matrix,M++}i.directional[g]=Y,g++}else if(D.isSpotLight){let Y=t.get(D);Y.position.setFromMatrixPosition(D.matrixWorld),Y.color.copy(z).multiplyScalar(X),Y.distance=W,Y.coneCos=Math.cos(D.angle),Y.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),Y.decay=D.decay,i.spot[y]=Y;let tt=D.shadow;if(D.map&&(i.spotLightMap[v]=D.map,v++,tt.updateMatrices(D),D.castShadow&&E++),i.spotLightMatrix[y]=tt.matrix,D.castShadow){let nt=e.get(D);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,i.spotShadow[y]=nt,i.spotShadowMap[y]=rt,A++}y++}else if(D.isRectAreaLight){let Y=t.get(D);Y.color.copy(z).multiplyScalar(X),Y.halfWidth.set(D.width*.5,0,0),Y.halfHeight.set(0,D.height*.5,0),i.rectArea[w]=Y,w++}else if(D.isPointLight){let Y=t.get(D);if(Y.color.copy(D.color).multiplyScalar(D.intensity),Y.distance=D.distance,Y.decay=D.decay,D.castShadow){let tt=D.shadow,nt=e.get(D);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,nt.shadowCameraNear=tt.camera.near,nt.shadowCameraFar=tt.camera.far,i.pointShadow[m]=nt,i.pointShadowMap[m]=rt,i.pointShadowMatrix[m]=D.shadow.matrix,S++}i.point[m]=Y,m++}else if(D.isHemisphereLight){let Y=t.get(D);Y.skyColor.copy(D.color).multiplyScalar(X),Y.groundColor.copy(D.groundColor).multiplyScalar(X),i.hemi[x]=Y,x++}}w>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=yt.LTC_FLOAT_1,i.rectAreaLTC2=yt.LTC_FLOAT_2):(i.rectAreaLTC1=yt.LTC_HALF_1,i.rectAreaLTC2=yt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;let I=i.hash;(I.sunLength!==f||I.directionalLength!==g||I.pointLength!==m||I.spotLength!==y||I.rectAreaLength!==w||I.hemiLength!==x||I.numSunShadows!==p||I.numDirectionalShadows!==M||I.numPointShadows!==S||I.numSpotShadows!==A||I.numSpotMaps!==v||I.numLightProbes!==P)&&(i.sun.length=f,i.directional.length=g,i.spot.length=y,i.rectArea.length=w,i.point.length=m,i.hemi.length=x,i.sunShadow.length=p,i.sunShadowMap.length=p,i.sunShadowMatrix.length=_,i.sunShadowCascade.length=_,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.directionalShadowMatrix.length=M,i.pointShadow.length=S,i.pointShadowMap.length=S,i.pointShadowMatrix.length=S,i.spotShadow.length=A,i.spotShadowMap.length=A,i.spotLightMatrix.length=A+v-E,i.spotLightMap.length=v,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=P,I.sunLength=f,I.directionalLength=g,I.pointLength=m,I.spotLength=y,I.rectAreaLength=w,I.hemiLength=x,I.numSunShadows=p,I.numDirectionalShadows=M,I.numPointShadows=S,I.numSpotShadows=A,I.numSpotMaps=v,I.numLightProbes=P,i.version=dS++)}function l(c,h){let d=0,u=0,f=0,p=0,_=0,g=0,m=h.matrixWorldInverse;for(let y=0,w=c.length;y<w;y++){let x=c[y];if(x.isSunLight){let M=i.sun[d];M.direction.setFromMatrixPosition(x.matrixWorld),M.direction.transformDirection(m),d++}else if(x.isDirectionalLight){let M=i.directional[u];M.direction.setFromMatrixPosition(x.matrixWorld),n.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(n),M.direction.transformDirection(m),u++}else if(x.isSpotLight){let M=i.spot[p];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(x.matrixWorld),n.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(n),M.direction.transformDirection(m),p++}else if(x.isRectAreaLight){let M=i.rectArea[_];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),a.identity(),r.copy(x.matrixWorld),r.premultiply(m),a.extractRotation(r),M.halfWidth.set(x.width*.5,0,0),M.halfHeight.set(0,x.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),_++}else if(x.isPointLight){let M=i.point[f];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),f++}else if(x.isHemisphereLight){let M=i.hemi[g];M.direction.setFromMatrixPosition(x.matrixWorld),M.direction.transformDirection(m),g++}}}return{setup:o,setupView:l,state:i}}function n0(s){let t=new pS(s),e=[],i=[],n=[];function r(u){d.camera=u,e.length=0,i.length=0,n.length=0}function a(u){e.push(u)}function o(u){i.push(u)}function l(u){n.push(u)}function c(){t.setup(e)}function h(u){t.setupView(e,u)}let d={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function mS(s){let t=new WeakMap;function e(n,r=0){let a=t.get(n),o;return a===void 0?(o=new n0(s),t.set(n,[o])):r>=a.length?(o=new n0(s),a.push(o)):o=a[r],o}function i(){t=new WeakMap}return{get:e,dispose:i}}var gS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,_S=`uniform sampler2D shadow_pass;
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
}`,xS=[new C(1,0,0),new C(-1,0,0),new C(0,1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1)],vS=[new C(0,-1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1),new C(0,-1,0),new C(0,-1,0)],s0=new Ht,ic=new C,Gf=new C;function yS(s,t,e){let i=new dn,n=new q,r=new q,a=new ge,o=new ia,l=new na,c={},h=e.maxTextureSize,d={[Un]:ri,[ri]:Un,[fi]:fi},u=new Ce({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new q},radius:{value:4}},vertexShader:gS,fragmentShader:_S}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let p=new kt;p.setAttribute("position",new he(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new ee(p,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=fa;let m=this.type;this.render=function(S,A,v){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||S.length===0)return;this.type===$d&&(pt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=fa);let E=s.getRenderTarget(),P=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),F=s.state;F.setBlending(Ri),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let B=m!==this.type;B&&A.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(z=>z.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,z=S.length;D<z;D++){let X=S[D],W=X.shadow;if(W===void 0){pt("WebGLShadowMap:",X,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;n.copy(W.mapSize);let rt=W.getFrameExtents();n.multiply(rt),r.copy(W.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/rt.x),n.x=r.x*rt.x,W.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/rt.y),n.y=r.y*rt.y,W.mapSize.y=r.y));let Y=s.state.buffers.depth.getReversed();if(W.camera._reversedDepth=Y,W.map===null||B===!0){if(W.map!==null&&(W.map.depthTexture!==null&&(W.map.depthTexture.dispose(),W.map.depthTexture=null),W.map.dispose()),this.type===tr){if(X.isPointLight){pt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}W.map=new Ae(n.x,n.y,{format:zn,type:$e,minFilter:Se,magFilter:Se,generateMipmaps:!1}),W.map.texture.name=X.name+".shadowMap",W.map.depthTexture=new Ln(n.x,n.y,ni),W.map.depthTexture.name=X.name+".shadowMapDepth",W.map.depthTexture.format=ji,W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=Ie,W.map.depthTexture.magFilter=Ie}else X.isPointLight?(W.map=new rc(n.x),W.map.depthTexture=new Eo(n.x,Pi)):(W.map=new Ae(n.x,n.y),W.map.depthTexture=new Ln(n.x,n.y,Pi)),W.map.depthTexture.name=X.name+".shadowMap",W.map.depthTexture.format=ji,this.type===fa?(W.map.depthTexture.compareFunction=Y?Ql:jl,W.map.depthTexture.minFilter=Se,W.map.depthTexture.magFilter=Se):(W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=Ie,W.map.depthTexture.magFilter=Ie);W.camera.updateProjectionMatrix()}W.map.isWebGLCubeRenderTarget!==!0&&(W.map.width!==n.x||W.map.height!==n.y)&&W.map.setSize(n.x,n.y);let tt=W.map.isWebGLCubeRenderTarget?6:W.getViewportCount();X.isPointLight!==!0&&W.updateMatrices(X,v);for(let nt=0;nt<tt;nt++){let Ut=W.getCamera(nt);if(X.isPointLight){let Rt=W.camera,ue=W.matrix,ie=X.distance||Rt.far;ie!==Rt.far&&(Rt.far=ie,Rt.updateProjectionMatrix()),ic.setFromMatrixPosition(X.matrixWorld),Rt.position.copy(ic),Gf.copy(Rt.position),Gf.add(xS[nt]),Rt.up.copy(vS[nt]),Rt.lookAt(Gf),Rt.updateMatrixWorld(),ue.makeTranslation(-ic.x,-ic.y,-ic.z),s0.multiplyMatrices(Rt.projectionMatrix,Rt.matrixWorldInverse),W._frustum.setFromProjectionMatrix(s0,Rt.coordinateSystem,Rt.reversedDepth)}if(W.map.isWebGLCubeRenderTarget)s.setRenderTarget(W.map,nt),s.clear();else{nt===0&&(s.setRenderTarget(W.map),s.clear());let Rt=W.getViewport(nt);a.set(r.x*Rt.x,r.y*Rt.y,r.x*Rt.z,r.y*Rt.w),F.viewport(a)}i=W.getFrustum(nt),x(A,v,Ut,X,this.type)}W.isPointLightShadow!==!0&&this.type===tr&&y(W,v),W.needsUpdate=!1}m=this.type,g.needsUpdate=!1,s.setRenderTarget(E,P,I)};function y(S,A){let v=t.update(_);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null?S.mapPass=new Ae(n.x,n.y,{format:zn,type:$e}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value.set(S.map.width,S.map.height),u.uniforms.radius.value=S.radius,s.setRenderTarget(S.mapPass),s.clear(),s.renderBufferDirect(A,null,v,u,_,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value.set(S.map.width,S.map.height),f.uniforms.radius.value=S.radius,s.setRenderTarget(S.map),s.clear(),s.renderBufferDirect(A,null,v,f,_,null)}function w(S,A,v,E){let P=null,I=v.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(I!==void 0)P=I;else if(P=v.isPointLight===!0?l:o,s.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let F=P.uuid,B=A.uuid,D=c[F];D===void 0&&(D={},c[F]=D);let z=D[B];z===void 0&&(z=P.clone(),D[B]=z,A.addEventListener("dispose",M)),P=z}if(P.visible=A.visible,P.wireframe=A.wireframe,E===tr?P.side=A.shadowSide!==null?A.shadowSide:A.side:P.side=A.shadowSide!==null?A.shadowSide:d[A.side],P.alphaMap=A.alphaMap,P.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,P.map=A.map,P.clipShadows=A.clipShadows,P.clippingPlanes=A.clippingPlanes,P.clipIntersection=A.clipIntersection,P.displacementMap=A.displacementMap,P.displacementScale=A.displacementScale,P.displacementBias=A.displacementBias,P.wireframeLinewidth=A.wireframeLinewidth,P.linewidth=A.linewidth,v.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let F=s.properties.get(P);F.light=v}return P}function x(S,A,v,E,P){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&P===tr)&&(!S.frustumCulled||S.intersectsFrustum(i))){S.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,S.matrixWorld);let B=t.update(S),D=S.material;if(Array.isArray(D)){let z=B.groups;for(let X=0,W=z.length;X<W;X++){let rt=z[X],Y=D[rt.materialIndex];if(Y&&Y.visible){let tt=w(S,Y,E,P);S.onBeforeShadow(s,S,A,v,B,tt,rt),s.renderBufferDirect(v,null,B,tt,S,rt),S.onAfterShadow(s,S,A,v,B,tt,rt)}}}else if(D.visible){let z=w(S,D,E,P);S.onBeforeShadow(s,S,A,v,B,z,null),s.renderBufferDirect(v,null,B,z,S,null),S.onAfterShadow(s,S,A,v,B,z,null)}}let F=S.children;for(let B=0,D=F.length;B<D;B++)x(F[B],A,v,E,P)}function M(S){S.target.removeEventListener("dispose",M);for(let v in c){let E=c[v],P=S.target.uuid;P in E&&(E[P].dispose(),delete E[P])}}}function MS(s,t){function e(){let U=!1,_t=new ge,K=null,xt=new ge(0,0,0,0);return{setMask:function(Tt){K!==Tt&&!U&&(s.colorMask(Tt,Tt,Tt,Tt),K=Tt)},setLocked:function(Tt){U=Tt},setClear:function(Tt,st,Bt,Lt,Me){Me===!0&&(Tt*=Lt,st*=Lt,Bt*=Lt),_t.set(Tt,st,Bt,Lt),xt.equals(_t)===!1&&(s.clearColor(Tt,st,Bt,Lt),xt.copy(_t))},reset:function(){U=!1,K=null,xt.set(-1,0,0,0)}}}function i(){let U=!1,_t=!1,K=null,xt=null,Tt=null;return{setReversed:function(st){if(_t!==st){let Bt=t.get("EXT_clip_control");st?Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.ZERO_TO_ONE_EXT):Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.NEGATIVE_ONE_TO_ONE_EXT),_t=st;let Lt=Tt;Tt=null,this.setClear(Lt)}},getReversed:function(){return _t},setTest:function(st){st?et(s.DEPTH_TEST):bt(s.DEPTH_TEST)},setMask:function(st){K!==st&&!U&&(s.depthMask(st),K=st)},setFunc:function(st){if(_t&&(st=Ag[st]),xt!==st){switch(st){case oo:s.depthFunc(s.NEVER);break;case lo:s.depthFunc(s.ALWAYS);break;case co:s.depthFunc(s.LESS);break;case Ps:s.depthFunc(s.LEQUAL);break;case ho:s.depthFunc(s.EQUAL);break;case uo:s.depthFunc(s.GEQUAL);break;case fo:s.depthFunc(s.GREATER);break;case po:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}xt=st}},setLocked:function(st){U=st},setClear:function(st){Tt!==st&&(Tt=st,_t&&(st=1-st),s.clearDepth(st))},reset:function(){U=!1,K=null,xt=null,Tt=null,_t=!1}}}function n(){let U=!1,_t=null,K=null,xt=null,Tt=null,st=null,Bt=null,Lt=null,Me=null;return{setTest:function(fe){U||(fe?et(s.STENCIL_TEST):bt(s.STENCIL_TEST))},setMask:function(fe){_t!==fe&&!U&&(s.stencilMask(fe),_t=fe)},setFunc:function(fe,Xi,ln){(K!==fe||xt!==Xi||Tt!==ln)&&(s.stencilFunc(fe,Xi,ln),K=fe,xt=Xi,Tt=ln)},setOp:function(fe,Xi,ln){(st!==fe||Bt!==Xi||Lt!==ln)&&(s.stencilOp(fe,Xi,ln),st=fe,Bt=Xi,Lt=ln)},setLocked:function(fe){U=fe},setClear:function(fe){Me!==fe&&(s.clearStencil(fe),Me=fe)},reset:function(){U=!1,_t=null,K=null,xt=null,Tt=null,st=null,Bt=null,Lt=null,Me=null}}}let r=new e,a=new i,o=new n,l=new WeakMap,c=new WeakMap,h={},d={},u={},f=new WeakMap,p=[],_=null,g=!1,m=null,y=null,w=null,x=null,M=null,S=null,A=null,v=new at(0,0,0),E=0,P=!1,I=null,F=null,B=null,D=null,z=null,X=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,rt=0,Y=s.getParameter(s.VERSION);Y.indexOf("WebGL")!==-1?(rt=parseFloat(/^WebGL (\d)/.exec(Y)[1]),W=rt>=1):Y.indexOf("OpenGL ES")!==-1&&(rt=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),W=rt>=2);let tt=null,nt={},Ut=s.getParameter(s.SCISSOR_BOX),Rt=s.getParameter(s.VIEWPORT),ue=new ge().fromArray(Ut),ie=new ge().fromArray(Rt);function ae(U,_t,K,xt){let Tt=new Uint8Array(4),st=s.createTexture();s.bindTexture(U,st),s.texParameteri(U,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(U,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Bt=0;Bt<K;Bt++)U===s.TEXTURE_3D||U===s.TEXTURE_2D_ARRAY?s.texImage3D(_t,0,s.RGBA,1,1,xt,0,s.RGBA,s.UNSIGNED_BYTE,Tt):s.texImage2D(_t+Bt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Tt);return st}let J={};J[s.TEXTURE_2D]=ae(s.TEXTURE_2D,s.TEXTURE_2D,1),J[s.TEXTURE_CUBE_MAP]=ae(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[s.TEXTURE_2D_ARRAY]=ae(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),J[s.TEXTURE_3D]=ae(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),et(s.DEPTH_TEST),a.setFunc(Ps),ct(!1),ft(cu),et(s.CULL_FACE),ot(Ri);function et(U){h[U]!==!0&&(s.enable(U),h[U]=!0)}function bt(U){h[U]!==!1&&(s.disable(U),h[U]=!1)}function Wt(U,_t){return u[U]!==_t?(s.bindFramebuffer(U,_t),u[U]=_t,U===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=_t),U===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=_t),!0):!1}function Et(U,_t){let K=p,xt=!1;if(U){K=f.get(_t),K===void 0&&(K=[],f.set(_t,K));let Tt=U.textures;if(K.length!==Tt.length||K[0]!==s.COLOR_ATTACHMENT0){for(let st=0,Bt=Tt.length;st<Bt;st++)K[st]=s.COLOR_ATTACHMENT0+st;K.length=Tt.length,xt=!0}}else K[0]!==s.BACK&&(K[0]=s.BACK,xt=!0);xt&&s.drawBuffers(K)}function qt(U){return _!==U?(s.useProgram(U),_=U,!0):!1}let _e={[cs]:s.FUNC_ADD,[Kd]:s.FUNC_SUBTRACT,[jd]:s.FUNC_REVERSE_SUBTRACT};_e[Qd]=s.MIN,_e[tf]=s.MAX;let it={[ef]:s.ZERO,[nf]:s.ONE,[sf]:s.SRC_COLOR,[du]:s.SRC_ALPHA,[hf]:s.SRC_ALPHA_SATURATE,[lf]:s.DST_COLOR,[af]:s.DST_ALPHA,[rf]:s.ONE_MINUS_SRC_COLOR,[fu]:s.ONE_MINUS_SRC_ALPHA,[cf]:s.ONE_MINUS_DST_COLOR,[of]:s.ONE_MINUS_DST_ALPHA,[uf]:s.CONSTANT_COLOR,[df]:s.ONE_MINUS_CONSTANT_COLOR,[ff]:s.CONSTANT_ALPHA,[pf]:s.ONE_MINUS_CONSTANT_ALPHA};function ot(U,_t,K,xt,Tt,st,Bt,Lt,Me,fe){if(U===Ri){g===!0&&(bt(s.BLEND),g=!1);return}if(g===!1&&(et(s.BLEND),g=!0),U!==Jd){if(U!==m||fe!==P){if((y!==cs||M!==cs)&&(s.blendEquation(s.FUNC_ADD),y=cs,M=cs),fe)switch(U){case er:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Fn:s.blendFunc(s.ONE,s.ONE);break;case hu:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case uu:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Dt("WebGLState: Invalid blending: ",U);break}else switch(U){case er:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Fn:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case hu:Dt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case uu:Dt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Dt("WebGLState: Invalid blending: ",U);break}w=null,x=null,S=null,A=null,v.set(0,0,0),E=0,m=U,P=fe}return}Tt=Tt||_t,st=st||K,Bt=Bt||xt,(_t!==y||Tt!==M)&&(s.blendEquationSeparate(_e[_t],_e[Tt]),y=_t,M=Tt),(K!==w||xt!==x||st!==S||Bt!==A)&&(s.blendFuncSeparate(it[K],it[xt],it[st],it[Bt]),w=K,x=xt,S=st,A=Bt),(Lt.equals(v)===!1||Me!==E)&&(s.blendColor(Lt.r,Lt.g,Lt.b,Me),v.copy(Lt),E=Me),m=U,P=!1}function lt(U,_t){U.side===fi?bt(s.CULL_FACE):et(s.CULL_FACE);let K=U.side===ri;_t&&(K=!K),ct(K),U.blending===er&&U.transparent===!1?ot(Ri):ot(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);let xt=U.stencilWrite;o.setTest(xt),xt&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),zt(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?et(s.SAMPLE_ALPHA_TO_COVERAGE):bt(s.SAMPLE_ALPHA_TO_COVERAGE)}function ct(U){I!==U&&(U?s.frontFace(s.CW):s.frontFace(s.CCW),I=U)}function ft(U){U!==Yd?(et(s.CULL_FACE),U!==F&&(U===cu?s.cullFace(s.BACK):U===Zd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):bt(s.CULL_FACE),F=U}function Vt(U){U!==B&&(W&&s.lineWidth(U),B=U)}function zt(U,_t,K){U?(et(s.POLYGON_OFFSET_FILL),(D!==_t||z!==K)&&(D=_t,z=K,a.getReversed()&&(_t=-_t),s.polygonOffset(_t,K))):bt(s.POLYGON_OFFSET_FILL)}function Yt(U){U?et(s.SCISSOR_TEST):bt(s.SCISSOR_TEST)}function $t(U){U===void 0&&(U=s.TEXTURE0+X-1),tt!==U&&(s.activeTexture(U),tt=U)}function L(U,_t,K){K===void 0&&(tt===null?K=s.TEXTURE0+X-1:K=tt);let xt=nt[K];xt===void 0&&(xt={type:void 0,texture:void 0},nt[K]=xt),(xt.type!==U||xt.texture!==_t)&&(tt!==K&&(s.activeTexture(K),tt=K),s.bindTexture(U,_t||J[U]),xt.type=U,xt.texture=_t)}function de(){let U=nt[tt];U!==void 0&&U.type!==void 0&&(s.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function ne(){try{s.compressedTexImage2D(...arguments)}catch(U){Dt("WebGLState:",U)}}function R(){try{s.compressedTexImage3D(...arguments)}catch(U){Dt("WebGLState:",U)}}function b(){try{s.texSubImage2D(...arguments)}catch(U){Dt("WebGLState:",U)}}function O(){try{s.texSubImage3D(...arguments)}catch(U){Dt("WebGLState:",U)}}function G(){try{s.compressedTexSubImage2D(...arguments)}catch(U){Dt("WebGLState:",U)}}function Z(){try{s.compressedTexSubImage3D(...arguments)}catch(U){Dt("WebGLState:",U)}}function ht(){try{s.texStorage2D(...arguments)}catch(U){Dt("WebGLState:",U)}}function dt(){try{s.texStorage3D(...arguments)}catch(U){Dt("WebGLState:",U)}}function $(){try{s.texImage2D(...arguments)}catch(U){Dt("WebGLState:",U)}}function Q(){try{s.texImage3D(...arguments)}catch(U){Dt("WebGLState:",U)}}function mt(U){return d[U]!==void 0?d[U]:s.getParameter(U)}function Ft(U,_t){d[U]!==_t&&(s.pixelStorei(U,_t),d[U]=_t)}function Mt(U){ue.equals(U)===!1&&(s.scissor(U.x,U.y,U.z,U.w),ue.copy(U))}function gt(U){ie.equals(U)===!1&&(s.viewport(U.x,U.y,U.z,U.w),ie.copy(U))}function Ot(U,_t){let K=c.get(_t);K===void 0&&(K=new WeakMap,c.set(_t,K));let xt=K.get(U);xt===void 0&&(xt=s.getUniformBlockIndex(_t,U.name),K.set(U,xt))}function Gt(U,_t){let xt=c.get(_t).get(U);l.get(_t)!==xt&&(s.uniformBlockBinding(_t,xt,U.__bindingPointIndex),l.set(_t,xt))}function Jt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},d={},tt=null,nt={},u={},f=new WeakMap,p=[],_=null,g=!1,m=null,y=null,w=null,x=null,M=null,S=null,A=null,v=new at(0,0,0),E=0,P=!1,I=null,F=null,B=null,D=null,z=null,ue.set(0,0,s.canvas.width,s.canvas.height),ie.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:et,disable:bt,bindFramebuffer:Wt,drawBuffers:Et,useProgram:qt,setBlending:ot,setMaterial:lt,setFlipSided:ct,setCullFace:ft,setLineWidth:Vt,setPolygonOffset:zt,setScissorTest:Yt,activeTexture:$t,bindTexture:L,unbindTexture:de,compressedTexImage2D:ne,compressedTexImage3D:R,texImage2D:$,texImage3D:Q,pixelStorei:Ft,getParameter:mt,updateUBOMapping:Ot,uniformBlockBinding:Gt,texStorage2D:ht,texStorage3D:dt,texSubImage2D:b,texSubImage3D:O,compressedTexSubImage2D:G,compressedTexSubImage3D:Z,scissor:Mt,viewport:gt,reset:Jt}}function bS(s,t,e,i,n,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new q,h=new WeakMap,d=new Set,u,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(R,b){return p?new OffscreenCanvas(R,b):Vr("canvas")}function g(R,b,O){let G=1,Z=ne(R);if((Z.width>O||Z.height>O)&&(G=O/Math.max(Z.width,Z.height)),G<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let ht=Math.floor(G*Z.width),dt=Math.floor(G*Z.height);u===void 0&&(u=_(ht,dt));let $=b?_(ht,dt):u;return $.width=ht,$.height=dt,$.getContext("2d").drawImage(R,0,0,ht,dt),pt("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+ht+"x"+dt+")."),$}else return"data"in R&&pt("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),R;return R}function m(R){return R.generateMipmaps}function y(R){s.generateMipmap(R)}function w(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function x(R,b,O,G,Z,ht=!1){if(R!==null){if(s[R]!==void 0)return s[R];pt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let dt;G&&(dt=t.get("EXT_texture_norm16"),dt||pt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let $=b;if(b===s.RED&&(O===s.FLOAT&&($=s.R32F),O===s.HALF_FLOAT&&($=s.R16F),O===s.UNSIGNED_BYTE&&($=s.R8),O===s.UNSIGNED_SHORT&&dt&&($=dt.R16_EXT),O===s.SHORT&&dt&&($=dt.R16_SNORM_EXT)),b===s.RED_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.R8UI),O===s.UNSIGNED_SHORT&&($=s.R16UI),O===s.UNSIGNED_INT&&($=s.R32UI),O===s.BYTE&&($=s.R8I),O===s.SHORT&&($=s.R16I),O===s.INT&&($=s.R32I)),b===s.RG&&(O===s.FLOAT&&($=s.RG32F),O===s.HALF_FLOAT&&($=s.RG16F),O===s.UNSIGNED_BYTE&&($=s.RG8),O===s.UNSIGNED_SHORT&&dt&&($=dt.RG16_EXT),O===s.SHORT&&dt&&($=dt.RG16_SNORM_EXT)),b===s.RG_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.RG8UI),O===s.UNSIGNED_SHORT&&($=s.RG16UI),O===s.UNSIGNED_INT&&($=s.RG32UI),O===s.BYTE&&($=s.RG8I),O===s.SHORT&&($=s.RG16I),O===s.INT&&($=s.RG32I)),b===s.RGB_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.RGB8UI),O===s.UNSIGNED_SHORT&&($=s.RGB16UI),O===s.UNSIGNED_INT&&($=s.RGB32UI),O===s.BYTE&&($=s.RGB8I),O===s.SHORT&&($=s.RGB16I),O===s.INT&&($=s.RGB32I)),b===s.RGBA_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.RGBA8UI),O===s.UNSIGNED_SHORT&&($=s.RGBA16UI),O===s.UNSIGNED_INT&&($=s.RGBA32UI),O===s.BYTE&&($=s.RGBA8I),O===s.SHORT&&($=s.RGBA16I),O===s.INT&&($=s.RGBA32I)),b===s.RGB&&(O===s.UNSIGNED_SHORT&&dt&&($=dt.RGB16_EXT),O===s.SHORT&&dt&&($=dt.RGB16_SNORM_EXT),O===s.UNSIGNED_INT_5_9_9_9_REV&&($=s.RGB9_E5),O===s.UNSIGNED_INT_10F_11F_11F_REV&&($=s.R11F_G11F_B10F)),b===s.RGBA){let Q=ht?kr:te.getTransfer(Z);O===s.FLOAT&&($=s.RGBA32F),O===s.HALF_FLOAT&&($=s.RGBA16F),O===s.UNSIGNED_BYTE&&($=Q===le?s.SRGB8_ALPHA8:s.RGBA8),O===s.UNSIGNED_SHORT&&dt&&($=dt.RGBA16_EXT),O===s.SHORT&&dt&&($=dt.RGBA16_SNORM_EXT),O===s.UNSIGNED_SHORT_4_4_4_4&&($=s.RGBA4),O===s.UNSIGNED_SHORT_5_5_5_1&&($=s.RGB5_A1)}return($===s.R16F||$===s.R32F||$===s.RG16F||$===s.RG32F||$===s.RGBA16F||$===s.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function M(R,b){let O;return R?b===null||b===Pi||b===rr?O=s.DEPTH24_STENCIL8:b===ni?O=s.DEPTH32F_STENCIL8:b===sr&&(O=s.DEPTH24_STENCIL8,pt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Pi||b===rr?O=s.DEPTH_COMPONENT24:b===ni?O=s.DEPTH_COMPONENT32F:b===sr&&(O=s.DEPTH_COMPONENT16),O}function S(R,b){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==Ie&&R.minFilter!==Se?Math.log2(Math.max(b.width,b.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?b.mipmaps.length:1}function A(R){let b=R.target;b.removeEventListener("dispose",A),E(b),b.isVideoTexture&&h.delete(b),b.isHTMLTexture&&d.delete(b)}function v(R){let b=R.target;b.removeEventListener("dispose",v),I(b)}function E(R){let b=i.get(R);if(b.__webglInit===void 0)return;let O=R.source,G=f.get(O);if(G){let Z=G[b.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&P(R),Object.keys(G).length===0&&f.delete(O)}i.remove(R)}function P(R){let b=i.get(R);s.deleteTexture(b.__webglTexture);let O=R.source,G=f.get(O);delete G[b.__cacheKey],a.memory.textures--}function I(R){let b=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(b.__webglFramebuffer[G]))for(let Z=0;Z<b.__webglFramebuffer[G].length;Z++)s.deleteFramebuffer(b.__webglFramebuffer[G][Z]);else s.deleteFramebuffer(b.__webglFramebuffer[G]);b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer[G])}else{if(Array.isArray(b.__webglFramebuffer))for(let G=0;G<b.__webglFramebuffer.length;G++)s.deleteFramebuffer(b.__webglFramebuffer[G]);else s.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&s.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let G=0;G<b.__webglColorRenderbuffer.length;G++)b.__webglColorRenderbuffer[G]&&s.deleteRenderbuffer(b.__webglColorRenderbuffer[G]);b.__webglDepthRenderbuffer&&s.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let O=R.textures;for(let G=0,Z=O.length;G<Z;G++){let ht=i.get(O[G]);ht.__webglTexture&&(s.deleteTexture(ht.__webglTexture),a.memory.textures--),i.remove(O[G])}i.remove(R)}let F=0;function B(){F=0}function D(){return F}function z(R){F=R}function X(){let R=F;return R>=n.maxTextures&&pt("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+n.maxTextures),F+=1,R}function W(R){let b=[];return b.push(R.wrapS),b.push(R.wrapT),b.push(R.wrapR||0),b.push(R.magFilter),b.push(R.minFilter),b.push(R.anisotropy),b.push(R.internalFormat),b.push(R.format),b.push(R.type),b.push(R.generateMipmaps),b.push(R.premultiplyAlpha),b.push(R.flipY),b.push(R.unpackAlignment),b.push(R.colorSpace),b.join()}function rt(R,b){let O=i.get(R);if(R.isVideoTexture&&L(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&O.__version!==R.version){let G=R.image;if(G===null)pt("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)pt("WebGLRenderer: Texture marked for update but image is incomplete");else{bt(O,R,b);return}}else R.isExternalTexture&&(O.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,O.__webglTexture,s.TEXTURE0+b)}function Y(R,b){let O=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&O.__version!==R.version){bt(O,R,b);return}else R.isExternalTexture&&(O.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,O.__webglTexture,s.TEXTURE0+b)}function tt(R,b){let O=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&O.__version!==R.version){bt(O,R,b);return}e.bindTexture(s.TEXTURE_3D,O.__webglTexture,s.TEXTURE0+b)}function nt(R,b){let O=i.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&O.__version!==R.version){Wt(O,R,b);return}e.bindTexture(s.TEXTURE_CUBE_MAP,O.__webglTexture,s.TEXTURE0+b)}let Ut={[Ur]:s.REPEAT,[hi]:s.CLAMP_TO_EDGE,[Fr]:s.MIRRORED_REPEAT},Rt={[Ie]:s.NEAREST,[pu]:s.NEAREST_MIPMAP_NEAREST,[nr]:s.NEAREST_MIPMAP_LINEAR,[Se]:s.LINEAR,[Sa]:s.LINEAR_MIPMAP_NEAREST,[rn]:s.LINEAR_MIPMAP_LINEAR},ue={[wf]:s.NEVER,[Rf]:s.ALWAYS,[Tf]:s.LESS,[jl]:s.LEQUAL,[Ef]:s.EQUAL,[Ql]:s.GEQUAL,[Af]:s.GREATER,[Cf]:s.NOTEQUAL};function ie(R,b){if(b.type===ni&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===Se||b.magFilter===Sa||b.magFilter===nr||b.magFilter===rn||b.minFilter===Se||b.minFilter===Sa||b.minFilter===nr||b.minFilter===rn)&&pt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,Ut[b.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,Ut[b.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,Ut[b.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,Rt[b.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,Rt[b.minFilter]),b.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,ue[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Ie||b.minFilter!==nr&&b.minFilter!==rn||b.type===ni&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||i.get(b).__currentAnisotropy){let O=t.get("EXT_texture_filter_anisotropic");s.texParameterf(R,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,n.getMaxAnisotropy())),i.get(b).__currentAnisotropy=b.anisotropy}}}function ae(R,b){let O=!1;R.__webglInit===void 0&&(R.__webglInit=!0,b.addEventListener("dispose",A));let G=b.source,Z=f.get(G);Z===void 0&&(Z={},f.set(G,Z));let ht=W(b);if(ht!==R.__cacheKey){Z[ht]===void 0&&(Z[ht]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,O=!0),Z[ht].usedTimes++;let dt=Z[R.__cacheKey];dt!==void 0&&(Z[R.__cacheKey].usedTimes--,dt.usedTimes===0&&P(b)),R.__cacheKey=ht,R.__webglTexture=Z[ht].texture}return O}function J(R,b,O){return Math.floor(Math.floor(R/O)/b)}function et(R,b,O,G){let ht=R.updateRanges;if(ht.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,b.width,b.height,O,G,b.data);else{ht.sort((Ft,Mt)=>Ft.start-Mt.start);let dt=0;for(let Ft=1;Ft<ht.length;Ft++){let Mt=ht[dt],gt=ht[Ft],Ot=Mt.start+Mt.count,Gt=J(gt.start,b.width,4),Jt=J(Mt.start,b.width,4);gt.start<=Ot+1&&Gt===Jt&&J(gt.start+gt.count-1,b.width,4)===Gt?Mt.count=Math.max(Mt.count,gt.start+gt.count-Mt.start):(++dt,ht[dt]=gt)}ht.length=dt+1;let $=e.getParameter(s.UNPACK_ROW_LENGTH),Q=e.getParameter(s.UNPACK_SKIP_PIXELS),mt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,b.width);for(let Ft=0,Mt=ht.length;Ft<Mt;Ft++){let gt=ht[Ft],Ot=Math.floor(gt.start/4),Gt=Math.ceil(gt.count/4),Jt=Ot%b.width,U=Math.floor(Ot/b.width),_t=Gt,K=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,Jt),e.pixelStorei(s.UNPACK_SKIP_ROWS,U),e.texSubImage2D(s.TEXTURE_2D,0,Jt,U,_t,K,O,G,b.data)}R.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,$),e.pixelStorei(s.UNPACK_SKIP_PIXELS,Q),e.pixelStorei(s.UNPACK_SKIP_ROWS,mt)}}function bt(R,b,O){let G=s.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(G=s.TEXTURE_2D_ARRAY),b.isData3DTexture&&(G=s.TEXTURE_3D);let Z=ae(R,b),ht=b.source;e.bindTexture(G,R.__webglTexture,s.TEXTURE0+O);let dt=i.get(ht);if(ht.version!==dt.__version||Z===!0){if(e.activeTexture(s.TEXTURE0+O),(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)===!1){let K=te.getPrimaries(te.workingColorSpace),xt=b.colorSpace===vn?null:te.getPrimaries(b.colorSpace),Tt=b.colorSpace===vn||K===xt?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Tt)}e.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment);let Q=g(b.image,!1,n.maxTextureSize);Q=de(b,Q);let mt=r.convert(b.format,b.colorSpace),Ft=r.convert(b.type),Mt=x(b.internalFormat,mt,Ft,b.normalized,b.colorSpace,b.isVideoTexture);ie(G,b);let gt,Ot=b.mipmaps,Gt=b.isVideoTexture!==!0,Jt=dt.__version===void 0||Z===!0,U=ht.dataReady,_t=S(b,Q);if(b.isDepthTexture)Mt=M(b.format===Bn,b.type),Jt&&(Gt?e.texStorage2D(s.TEXTURE_2D,1,Mt,Q.width,Q.height):e.texImage2D(s.TEXTURE_2D,0,Mt,Q.width,Q.height,0,mt,Ft,null));else if(b.isDataTexture)if(Ot.length>0){Gt&&Jt&&e.texStorage2D(s.TEXTURE_2D,_t,Mt,Ot[0].width,Ot[0].height);for(let K=0,xt=Ot.length;K<xt;K++)gt=Ot[K],Gt?U&&e.texSubImage2D(s.TEXTURE_2D,K,0,0,gt.width,gt.height,mt,Ft,gt.data):e.texImage2D(s.TEXTURE_2D,K,Mt,gt.width,gt.height,0,mt,Ft,gt.data);b.generateMipmaps=!1}else Gt?(Jt&&e.texStorage2D(s.TEXTURE_2D,_t,Mt,Q.width,Q.height),U&&et(b,Q,mt,Ft)):e.texImage2D(s.TEXTURE_2D,0,Mt,Q.width,Q.height,0,mt,Ft,Q.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Gt&&Jt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,_t,Mt,Ot[0].width,Ot[0].height,Q.depth);for(let K=0,xt=Ot.length;K<xt;K++)if(gt=Ot[K],b.format!==si)if(mt!==null)if(Gt){if(U)if(b.layerUpdates.size>0){let Tt=Su(gt.width,gt.height,b.format,b.type);for(let st of b.layerUpdates){let Bt=gt.data.subarray(st*Tt/gt.data.BYTES_PER_ELEMENT,(st+1)*Tt/gt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,K,0,0,st,gt.width,gt.height,1,mt,Bt)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,K,0,0,0,gt.width,gt.height,Q.depth,mt,gt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,K,Mt,gt.width,gt.height,Q.depth,0,gt.data,0,0);else pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Gt?U&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,K,0,0,0,gt.width,gt.height,Q.depth,mt,Ft,gt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,K,Mt,gt.width,gt.height,Q.depth,0,mt,Ft,gt.data);b.layerUpdates.size>0&&b.clearLayerUpdates()}else{Gt&&Jt&&e.texStorage2D(s.TEXTURE_2D,_t,Mt,Ot[0].width,Ot[0].height);for(let K=0,xt=Ot.length;K<xt;K++)gt=Ot[K],b.format!==si?mt!==null?Gt?U&&e.compressedTexSubImage2D(s.TEXTURE_2D,K,0,0,gt.width,gt.height,mt,gt.data):e.compressedTexImage2D(s.TEXTURE_2D,K,Mt,gt.width,gt.height,0,gt.data):pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Gt?U&&e.texSubImage2D(s.TEXTURE_2D,K,0,0,gt.width,gt.height,mt,Ft,gt.data):e.texImage2D(s.TEXTURE_2D,K,Mt,gt.width,gt.height,0,mt,Ft,gt.data)}else if(b.isDataArrayTexture)if(Gt){if(Jt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,_t,Mt,Q.width,Q.height,Q.depth),U)if(b.layerUpdates.size>0){let K=Su(Q.width,Q.height,b.format,b.type);for(let xt of b.layerUpdates){let Tt=Q.data.subarray(xt*K/Q.data.BYTES_PER_ELEMENT,(xt+1)*K/Q.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,xt,Q.width,Q.height,1,mt,Ft,Tt)}b.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,mt,Ft,Q.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Mt,Q.width,Q.height,Q.depth,0,mt,Ft,Q.data);else if(b.isData3DTexture)Gt?(Jt&&e.texStorage3D(s.TEXTURE_3D,_t,Mt,Q.width,Q.height,Q.depth),U&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,mt,Ft,Q.data)):e.texImage3D(s.TEXTURE_3D,0,Mt,Q.width,Q.height,Q.depth,0,mt,Ft,Q.data);else if(b.isFramebufferTexture){if(Jt)if(Gt)e.texStorage2D(s.TEXTURE_2D,_t,Mt,Q.width,Q.height);else{let K=Q.width,xt=Q.height;for(let Tt=0;Tt<_t;Tt++)e.texImage2D(s.TEXTURE_2D,Tt,Mt,K,xt,0,mt,Ft,null),K>>=1,xt>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in s){let K=s.canvas;if(K.hasAttribute("layoutsubtree")||K.setAttribute("layoutsubtree","true"),Q.parentNode!==K){K.appendChild(Q),d.add(b),K.onpaint=xt=>{let Tt=xt.changedElements;for(let st of d)Tt.includes(st.image)&&(st.needsUpdate=!0)},K.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,Q);else{let Tt=s.RGBA,st=s.RGBA,Bt=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,Tt,st,Bt,Q)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Ot.length>0){if(Gt&&Jt){let K=ne(Ot[0]);e.texStorage2D(s.TEXTURE_2D,_t,Mt,K.width,K.height)}for(let K=0,xt=Ot.length;K<xt;K++)gt=Ot[K],Gt?U&&e.texSubImage2D(s.TEXTURE_2D,K,0,0,mt,Ft,gt):e.texImage2D(s.TEXTURE_2D,K,Mt,mt,Ft,gt);b.generateMipmaps=!1}else if(Gt){if(Jt){let K=ne(Q);e.texStorage2D(s.TEXTURE_2D,_t,Mt,K.width,K.height)}U&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,mt,Ft,Q)}else e.texImage2D(s.TEXTURE_2D,0,Mt,mt,Ft,Q);m(b)&&y(G),dt.__version=ht.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function Wt(R,b,O){if(b.image.length!==6)return;let G=ae(R,b),Z=b.source;e.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+O);let ht=i.get(Z);if(Z.version!==ht.__version||G===!0){e.activeTexture(s.TEXTURE0+O);let dt=te.getPrimaries(te.workingColorSpace),$=b.colorSpace===vn?null:te.getPrimaries(b.colorSpace),Q=b.colorSpace===vn||dt===$?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);let mt=b.isCompressedTexture||b.image[0].isCompressedTexture,Ft=b.image[0]&&b.image[0].isDataTexture,Mt=[];for(let st=0;st<6;st++)!mt&&!Ft?Mt[st]=g(b.image[st],!0,n.maxCubemapSize):Mt[st]=Ft?b.image[st].image:b.image[st],Mt[st]=de(b,Mt[st]);let gt=Mt[0],Ot=r.convert(b.format,b.colorSpace),Gt=r.convert(b.type),Jt=x(b.internalFormat,Ot,Gt,b.normalized,b.colorSpace),U=b.isVideoTexture!==!0,_t=ht.__version===void 0||G===!0,K=Z.dataReady,xt=S(b,gt);ie(s.TEXTURE_CUBE_MAP,b);let Tt;if(mt){U&&_t&&e.texStorage2D(s.TEXTURE_CUBE_MAP,xt,Jt,gt.width,gt.height);for(let st=0;st<6;st++){Tt=Mt[st].mipmaps;for(let Bt=0;Bt<Tt.length;Bt++){let Lt=Tt[Bt];b.format!==si?Ot!==null?U?K&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,Bt,0,0,Lt.width,Lt.height,Ot,Lt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,Bt,Jt,Lt.width,Lt.height,0,Lt.data):pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?K&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,Bt,0,0,Lt.width,Lt.height,Ot,Gt,Lt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,Bt,Jt,Lt.width,Lt.height,0,Ot,Gt,Lt.data)}}}else{if(Tt=b.mipmaps,U&&_t){Tt.length>0&&xt++;let st=ne(Mt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,xt,Jt,st.width,st.height)}for(let st=0;st<6;st++)if(Ft){U?K&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,Mt[st].width,Mt[st].height,Ot,Gt,Mt[st].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,Jt,Mt[st].width,Mt[st].height,0,Ot,Gt,Mt[st].data);for(let Bt=0;Bt<Tt.length;Bt++){let Me=Tt[Bt].image[st].image;U?K&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,Bt+1,0,0,Me.width,Me.height,Ot,Gt,Me.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,Bt+1,Jt,Me.width,Me.height,0,Ot,Gt,Me.data)}}else{U?K&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,Ot,Gt,Mt[st]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,Jt,Ot,Gt,Mt[st]);for(let Bt=0;Bt<Tt.length;Bt++){let Lt=Tt[Bt];U?K&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,Bt+1,0,0,Ot,Gt,Lt.image[st]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+st,Bt+1,Jt,Ot,Gt,Lt.image[st])}}}m(b)&&y(s.TEXTURE_CUBE_MAP),ht.__version=Z.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function Et(R,b,O,G,Z,ht){let dt=r.convert(O.format,O.colorSpace),$=r.convert(O.type),Q=x(O.internalFormat,dt,$,O.normalized,O.colorSpace),mt=i.get(b),Ft=i.get(O);if(Ft.__renderTarget=b,!mt.__hasExternalTextures){let Mt=Math.max(1,b.width>>ht),gt=Math.max(1,b.height>>ht);Z===s.TEXTURE_3D||Z===s.TEXTURE_2D_ARRAY?e.texImage3D(Z,ht,Q,Mt,gt,b.depth,0,dt,$,null):e.texImage2D(Z,ht,Q,Mt,gt,0,dt,$,null)}e.bindFramebuffer(s.FRAMEBUFFER,R),$t(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,G,Z,Ft.__webglTexture,0,Yt(b)):(Z===s.TEXTURE_2D||Z>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,G,Z,Ft.__webglTexture,ht),e.bindFramebuffer(s.FRAMEBUFFER,null)}function qt(R,b,O){if(s.bindRenderbuffer(s.RENDERBUFFER,R),b.depthBuffer){let G=b.depthTexture,Z=G&&G.isDepthTexture?G.type:null,ht=M(b.stencilBuffer,Z),dt=b.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;$t(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Yt(b),ht,b.width,b.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,Yt(b),ht,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,ht,b.width,b.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,dt,s.RENDERBUFFER,R)}else{let G=b.textures;for(let Z=0;Z<G.length;Z++){let ht=G[Z],dt=r.convert(ht.format,ht.colorSpace),$=r.convert(ht.type),Q=x(ht.internalFormat,dt,$,ht.normalized,ht.colorSpace);$t(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Yt(b),Q,b.width,b.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,Yt(b),Q,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,Q,b.width,b.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function _e(R,b,O){let G=b.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,R),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Z=i.get(b.depthTexture);if(Z.__renderTarget=b,(!Z.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),G){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,b.depthTexture.addEventListener("dispose",A)),Z.__webglTexture===void 0){Z.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,Z.__webglTexture),ie(s.TEXTURE_CUBE_MAP,b.depthTexture);let mt=r.convert(b.depthTexture.format),Ft=r.convert(b.depthTexture.type),Mt;b.depthTexture.format===ji?Mt=s.DEPTH_COMPONENT24:b.depthTexture.format===Bn&&(Mt=s.DEPTH24_STENCIL8);for(let gt=0;gt<6;gt++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,Mt,b.width,b.height,0,mt,Ft,null)}}else rt(b.depthTexture,0);let ht=Z.__webglTexture,dt=Yt(b),$=G?s.TEXTURE_CUBE_MAP_POSITIVE_X+O:s.TEXTURE_2D,Q=b.depthTexture.format===Bn?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(b.depthTexture.format===ji)$t(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Q,$,ht,0,dt):s.framebufferTexture2D(s.FRAMEBUFFER,Q,$,ht,0);else if(b.depthTexture.format===Bn)$t(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Q,$,ht,0,dt):s.framebufferTexture2D(s.FRAMEBUFFER,Q,$,ht,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function it(R){let b=i.get(R),O=R.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==R.depthTexture){let G=R.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),G){let Z=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,G.removeEventListener("dispose",Z)};G.addEventListener("dispose",Z),b.__depthDisposeCallback=Z}b.__boundDepthTexture=G}if(R.depthTexture&&!b.__autoAllocateDepthBuffer)if(O)for(let G=0;G<6;G++)_e(b.__webglFramebuffer[G],R,G);else{let G=R.texture.mipmaps;G&&G.length>0?_e(b.__webglFramebuffer[0],R,0):_e(b.__webglFramebuffer,R,0)}else if(O){b.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[G]),b.__webglDepthbuffer[G]===void 0)b.__webglDepthbuffer[G]=s.createRenderbuffer(),qt(b.__webglDepthbuffer[G],R,!1);else{let Z=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ht=b.__webglDepthbuffer[G];s.bindRenderbuffer(s.RENDERBUFFER,ht),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,ht)}}else{let G=R.texture.mipmaps;if(G&&G.length>0?e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=s.createRenderbuffer(),qt(b.__webglDepthbuffer,R,!1);else{let Z=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ht=b.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ht),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,ht)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function ot(R,b,O){let G=i.get(R);b!==void 0&&Et(G.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),O!==void 0&&it(R)}function lt(R){let b=R.texture,O=i.get(R),G=i.get(b);R.addEventListener("dispose",v);let Z=R.textures,ht=R.isWebGLCubeRenderTarget===!0,dt=Z.length>1;if(dt||(G.__webglTexture===void 0&&(G.__webglTexture=s.createTexture()),G.__version=b.version,a.memory.textures++),ht){O.__webglFramebuffer=[];for(let $=0;$<6;$++)if(b.mipmaps&&b.mipmaps.length>0){O.__webglFramebuffer[$]=[];for(let Q=0;Q<b.mipmaps.length;Q++)O.__webglFramebuffer[$][Q]=s.createFramebuffer()}else O.__webglFramebuffer[$]=s.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){O.__webglFramebuffer=[];for(let $=0;$<b.mipmaps.length;$++)O.__webglFramebuffer[$]=s.createFramebuffer()}else O.__webglFramebuffer=s.createFramebuffer();if(dt)for(let $=0,Q=Z.length;$<Q;$++){let mt=i.get(Z[$]);mt.__webglTexture===void 0&&(mt.__webglTexture=s.createTexture(),a.memory.textures++)}if(R.samples>0&&$t(R)===!1){O.__webglMultisampledFramebuffer=s.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let $=0;$<Z.length;$++){let Q=Z[$];O.__webglColorRenderbuffer[$]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,O.__webglColorRenderbuffer[$]);let mt=r.convert(Q.format,Q.colorSpace),Ft=r.convert(Q.type),Mt=x(Q.internalFormat,mt,Ft,Q.normalized,Q.colorSpace,R.isXRRenderTarget===!0),gt=Yt(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,gt,Mt,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+$,s.RENDERBUFFER,O.__webglColorRenderbuffer[$])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(O.__webglDepthRenderbuffer=s.createRenderbuffer(),qt(O.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(ht){e.bindTexture(s.TEXTURE_CUBE_MAP,G.__webglTexture),ie(s.TEXTURE_CUBE_MAP,b);for(let $=0;$<6;$++)if(b.mipmaps&&b.mipmaps.length>0)for(let Q=0;Q<b.mipmaps.length;Q++)Et(O.__webglFramebuffer[$][Q],R,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+$,Q);else Et(O.__webglFramebuffer[$],R,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+$,0);m(b)&&y(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(dt){for(let $=0,Q=Z.length;$<Q;$++){let mt=Z[$],Ft=i.get(mt),Mt=s.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Mt=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(Mt,Ft.__webglTexture),ie(Mt,mt),Et(O.__webglFramebuffer,R,mt,s.COLOR_ATTACHMENT0+$,Mt,0),m(mt)&&y(Mt)}e.unbindTexture()}else{let $=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&($=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture($,G.__webglTexture),ie($,b),b.mipmaps&&b.mipmaps.length>0)for(let Q=0;Q<b.mipmaps.length;Q++)Et(O.__webglFramebuffer[Q],R,b,s.COLOR_ATTACHMENT0,$,Q);else Et(O.__webglFramebuffer,R,b,s.COLOR_ATTACHMENT0,$,0);m(b)&&y($),e.unbindTexture()}R.depthBuffer&&it(R)}function ct(R){let b=R.textures;for(let O=0,G=b.length;O<G;O++){let Z=b[O];if(m(Z)){let ht=w(R),dt=i.get(Z).__webglTexture;e.bindTexture(ht,dt),y(ht),e.unbindTexture()}}}let ft=[],Vt=[];function zt(R){if(R.samples>0){if($t(R)===!1){let b=R.textures,O=R.width,G=R.height,Z=s.COLOR_BUFFER_BIT,ht=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,dt=i.get(R),$=b.length>1;if($)for(let mt=0;mt<b.length;mt++)e.bindFramebuffer(s.FRAMEBUFFER,dt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+mt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,dt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+mt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,dt.__webglMultisampledFramebuffer);let Q=R.texture.mipmaps;Q&&Q.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,dt.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,dt.__webglFramebuffer);for(let mt=0;mt<b.length;mt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(Z|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(Z|=s.STENCIL_BUFFER_BIT)),$){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,dt.__webglColorRenderbuffer[mt]);let Ft=i.get(b[mt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Ft,0)}s.blitFramebuffer(0,0,O,G,0,0,O,G,Z,s.NEAREST),l===!0&&(ft.length=0,Vt.length=0,ft.push(s.COLOR_ATTACHMENT0+mt),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(ft.push(ht),Vt.push(ht),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Vt)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,ft))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),$)for(let mt=0;mt<b.length;mt++){e.bindFramebuffer(s.FRAMEBUFFER,dt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+mt,s.RENDERBUFFER,dt.__webglColorRenderbuffer[mt]);let Ft=i.get(b[mt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,dt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+mt,s.TEXTURE_2D,Ft,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,dt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){let b=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[b])}}}function Yt(R){return Math.min(n.maxSamples,R.samples)}function $t(R){let b=i.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function L(R){let b=a.render.frame;h.get(R)!==b&&(h.set(R,b),R.update())}function de(R,b){let O=R.colorSpace,G=R.format,Z=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||O!==zr&&O!==vn&&(te.getTransfer(O)===le?(G!==si||Z!==pi)&&pt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Dt("WebGLTextures: Unsupported texture color space:",O)),b}function ne(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=X,this.resetTextureUnits=B,this.getTextureUnits=D,this.setTextureUnits=z,this.setTexture2D=rt,this.setTexture2DArray=Y,this.setTexture3D=tt,this.setTextureCube=nt,this.rebindTextures=ot,this.setupRenderTarget=lt,this.updateRenderTargetMipmap=ct,this.updateMultisampleRenderTarget=zt,this.setupDepthRenderbuffer=it,this.setupFrameBufferTexture=Et,this.useMultisampledRTT=$t,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function u0(s,t){function e(i,n=vn){let r,a=te.getTransfer(n);if(i===pi)return s.UNSIGNED_BYTE;if(i===gl)return s.UNSIGNED_SHORT_4_4_4_4;if(i===_l)return s.UNSIGNED_SHORT_5_5_5_1;if(i===_u)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===xu)return s.UNSIGNED_INT_10F_11F_11F_REV;if(i===mu)return s.BYTE;if(i===gu)return s.SHORT;if(i===sr)return s.UNSIGNED_SHORT;if(i===ml)return s.INT;if(i===Pi)return s.UNSIGNED_INT;if(i===ni)return s.FLOAT;if(i===$e)return s.HALF_FLOAT;if(i===vu)return s.ALPHA;if(i===yu)return s.RGB;if(i===si)return s.RGBA;if(i===ji)return s.DEPTH_COMPONENT;if(i===Bn)return s.DEPTH_STENCIL;if(i===xl)return s.RED;if(i===wa)return s.RED_INTEGER;if(i===zn)return s.RG;if(i===vl)return s.RG_INTEGER;if(i===yl)return s.RGBA_INTEGER;if(i===Ta||i===Ea||i===Aa||i===Ca)if(a===le)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Ta)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Ca)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Ta)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ea)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Aa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Ca)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ml||i===bl||i===Sl||i===wl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ml)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===bl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Sl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===wl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Tl||i===El||i===Al||i===Cl||i===Rl||i===Ra||i===Pl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Tl||i===El)return a===le?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Al)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Cl)return r.COMPRESSED_R11_EAC;if(i===Rl)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Ra)return r.COMPRESSED_RG11_EAC;if(i===Pl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Il||i===Ll||i===Dl||i===Nl||i===Ul||i===Fl||i===Ol||i===Bl||i===zl||i===kl||i===Vl||i===Gl||i===Hl||i===Wl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Il)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ll)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Dl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Nl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Ul)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Fl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ol)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Bl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===zl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===kl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Vl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Gl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Hl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Wl)return a===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Xl||i===ql||i===Yl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===Xl)return a===le?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===ql)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Yl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Zl||i===$l||i===Pa||i===Jl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Zl)return r.COMPRESSED_RED_RGTC1_EXT;if(i===$l)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Pa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Jl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===rr?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:e}}var SS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,wS=`
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

}`,Jf=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Yr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new Ce({vertexShader:SS,fragmentShader:wS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ee(new Ci(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Kf=class extends vi{constructor(t,e){super();let i=this,n=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,p=null,_=typeof XRWebGLBinding<"u",g=new Jf,m={},y=e.getContextAttributes(),w=null,x=null,M=[],S=[],A=new q,v=null,E=null,P=new ze;P.viewport=new ge;let I=new ze;I.viewport=new ge;let F=[P,I],B=new cl,D=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let et=M[J];return et===void 0&&(et=new Us,M[J]=et),et.getTargetRaySpace()},this.getControllerGrip=function(J){let et=M[J];return et===void 0&&(et=new Us,M[J]=et),et.getGripSpace()},this.getHand=function(J){let et=M[J];return et===void 0&&(et=new Us,M[J]=et),et.getHandSpace()};function X(J){let et=S.indexOf(J.inputSource);if(et===-1)return;let bt=M[et];bt!==void 0&&(bt.update(J.inputSource,J.frame,c||a),bt.dispatchEvent({type:J.type,data:J.inputSource}))}function W(){n.removeEventListener("select",X),n.removeEventListener("selectstart",X),n.removeEventListener("selectend",X),n.removeEventListener("squeeze",X),n.removeEventListener("squeezestart",X),n.removeEventListener("squeezeend",X),n.removeEventListener("end",W),n.removeEventListener("inputsourceschange",rt);for(let J=0;J<M.length;J++){let et=S[J];et!==null&&(S[J]=null,M[J].disconnect(et))}D=null,z=null,g.reset();for(let J in m)delete m[J];if(t.setRenderTarget(w),f=null,u=null,d=null,n=null,x=null,ae.stop(),i.isPresenting=!1,t.setPixelRatio(v),t.setSize(A.width,A.height,!1),E!==null){let J=E.camera;J.fov=E.fov,J.zoom=E.zoom,J.updateProjectionMatrix(),E=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,i.isPresenting===!0&&pt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,i.isPresenting===!0&&pt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(n,e)),d},this.getFrame=function(){return p},this.getSession=function(){return n},this.setSession=async function(J){if(n=J,n!==null){if(w=t.getRenderTarget(),n.addEventListener("select",X),n.addEventListener("selectstart",X),n.addEventListener("selectend",X),n.addEventListener("squeeze",X),n.addEventListener("squeezestart",X),n.addEventListener("squeezeend",X),n.addEventListener("end",W),n.addEventListener("inputsourceschange",rt),y.xrCompatible!==!0&&await e.makeXRCompatible(),v=t.getPixelRatio(),t.getSize(A),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let bt=null,Wt=null,Et=null;y.depth&&(Et=y.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,bt=y.stencil?Bn:ji,Wt=y.stencil?rr:Pi);let qt={colorFormat:e.RGBA8,depthFormat:Et,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(qt),n.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),x=new Ae(u.textureWidth,u.textureHeight,{format:si,type:pi,depthTexture:new Ln(u.textureWidth,u.textureHeight,Wt,void 0,void 0,void 0,void 0,void 0,void 0,bt),stencilBuffer:y.stencil,colorSpace:t.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let bt={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(n,e,bt),n.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new Ae(f.framebufferWidth,f.framebufferHeight,{format:si,type:pi,colorSpace:t.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await n.requestReferenceSpace(o),ae.setContext(n),ae.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function rt(J){for(let et=0;et<J.removed.length;et++){let bt=J.removed[et],Wt=S.indexOf(bt);Wt>=0&&(S[Wt]=null,M[Wt].disconnect(bt))}for(let et=0;et<J.added.length;et++){let bt=J.added[et],Wt=S.indexOf(bt);if(Wt===-1){for(let qt=0;qt<M.length;qt++)if(qt>=S.length){S.push(bt),Wt=qt;break}else if(S[qt]===null){S[qt]=bt,Wt=qt;break}if(Wt===-1)break}let Et=M[Wt];Et&&Et.connect(bt)}}let Y=new C,tt=new C;function nt(J,et,bt){Y.setFromMatrixPosition(et.matrixWorld),tt.setFromMatrixPosition(bt.matrixWorld);let Wt=Y.distanceTo(tt),Et=et.projectionMatrix.elements,qt=bt.projectionMatrix.elements,_e=Et[14]/(Et[10]-1),it=Et[14]/(Et[10]+1),ot=(Et[9]+1)/Et[5],lt=(Et[9]-1)/Et[5],ct=(Et[8]-1)/Et[0],ft=(qt[8]+1)/qt[0],Vt=_e*ct,zt=_e*ft,Yt=Wt/(-ct+ft),$t=Yt*-ct;if(et.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX($t),J.translateZ(Yt),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Et[10]===-1)J.projectionMatrix.copy(et.projectionMatrix),J.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{let L=_e+Yt,de=it+Yt,ne=Vt-$t,R=zt+(Wt-$t),b=ot*it/de*L,O=lt*it/de*L;J.projectionMatrix.makePerspective(ne,R,b,O,L,de),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function Ut(J,et){et===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(et.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(n===null)return;let et=J.near,bt=J.far;g.texture!==null&&(g.depthNear>0&&(et=g.depthNear),g.depthFar>0&&(bt=g.depthFar)),B.near=I.near=P.near=et,B.far=I.far=P.far=bt,(D!==B.near||z!==B.far)&&(n.updateRenderState({depthNear:B.near,depthFar:B.far}),D=B.near,z=B.far),B.layers.mask=J.layers.mask|6,P.layers.mask=B.layers.mask&-5,I.layers.mask=B.layers.mask&-3;let Wt=J.parent,Et=B.cameras;Ut(B,Wt);for(let qt=0;qt<Et.length;qt++)Ut(Et[qt],Wt);Et.length===2?nt(B,P,I):B.projectionMatrix.copy(P.projectionMatrix),E===null&&J.isPerspectiveCamera&&(E={camera:J,fov:J.fov,zoom:J.zoom}),Rt(J,B,Wt)};function Rt(J,et,bt){bt===null?J.matrix.copy(et.matrixWorld):(J.matrix.copy(bt.matrixWorld),J.matrix.invert(),J.matrix.multiply(et.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(et.projectionMatrix),J.projectionMatrixInverse.copy(et.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Is*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(J){l=J,u!==null&&(u.fixedFoveation=J),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=J)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(B)},this.getCameraTexture=function(J){return m[J]};let ue=null;function ie(J,et){if(h=et.getViewerPose(c||a),p=et,h!==null){let bt=h.views;f!==null&&(t.setRenderTargetFramebuffer(x,f.framebuffer),t.setRenderTarget(x));let Wt=!1;bt.length!==B.cameras.length&&(B.cameras.length=0,Wt=!0);for(let it=0;it<bt.length;it++){let ot=bt[it],lt=null;if(f!==null)lt=f.getViewport(ot);else{let ft=d.getViewSubImage(u,ot);lt=ft.viewport,it===0&&(t.setRenderTargetTextures(x,ft.colorTexture,ft.depthStencilTexture),t.setRenderTarget(x))}let ct=F[it];ct===void 0&&(ct=new ze,ct.layers.enable(it),ct.viewport=new ge,F[it]=ct),ct.matrix.fromArray(ot.transform.matrix),ct.matrix.decompose(ct.position,ct.quaternion,ct.scale),ct.projectionMatrix.fromArray(ot.projectionMatrix),ct.projectionMatrixInverse.copy(ct.projectionMatrix).invert(),ct.viewport.set(lt.x,lt.y,lt.width,lt.height),it===0&&(B.matrix.copy(ct.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Wt===!0&&B.cameras.push(ct)}let Et=n.enabledFeatures;if(Et&&Et.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&_){d=i.getBinding();let it=d.getDepthInformation(bt[0]);it&&it.isValid&&it.texture&&g.init(it,n.renderState)}if(Et&&Et.includes("camera-access")&&_){t.state.unbindTexture(),d=i.getBinding();for(let it=0;it<bt.length;it++){let ot=bt[it].camera;if(ot){let lt=m[ot];lt||(lt=new Yr,m[ot]=lt);let ct=d.getCameraImage(ot);lt.sourceTexture=ct}}}}for(let bt=0;bt<M.length;bt++){let Wt=S[bt],Et=M[bt];Wt!==null&&Et!==void 0&&Et.update(Wt,et,c||a)}ue&&ue(J,et),et.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:et}),p=null}let ae=new r0;ae.setAnimationLoop(ie),this.setAnimationLoop=function(J){ue=J},this.dispose=function(){}}},TS=new Ht,d0=new Zt;d0.set(-1,0,0,0,1,0,0,0,1);function ES(s,t){function e(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function i(g,m){m.color.getRGB(g.fogColor.value,Df(s)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function n(g,m,y,w,x){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(g,m):m.isMeshLambertMaterial?(r(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(g,m),d(g,m)):m.isMeshPhongMaterial?(r(g,m),h(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(g,m),u(g,m),m.isMeshPhysicalMaterial&&f(g,m,x)):m.isMeshMatcapMaterial?(r(g,m),p(g,m)):m.isMeshDepthMaterial?r(g,m):m.isMeshDistanceMaterial?(r(g,m),_(g,m)):m.isMeshNormalMaterial?r(g,m):m.isLineBasicMaterial?(a(g,m),m.isLineDashedMaterial&&o(g,m)):m.isPointsMaterial?l(g,m,y,w):m.isSpriteMaterial?c(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,e(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===ri&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,e(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===ri&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,e(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,e(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);let y=t.get(m),w=y.envMap,x=y.envMapRotation;w&&(g.envMap.value=w,g.envMapRotation.value.setFromMatrix4(TS.makeRotationFromEuler(x)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(d0),g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,g.aoMapTransform))}function a(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform))}function o(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function l(g,m,y,w){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*y,g.scale.value=w*.5,m.map&&(g.map.value=m.map,e(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function c(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function h(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function d(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function u(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function f(g,m,y){g.ior.value=m.ior,m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===ri&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.retroreflectivity>0&&(g.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=y.texture,g.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,g.specularIntensityMapTransform))}function p(g,m){m.matcap&&(g.matcap.value=m.matcap)}function _(g,m){let y=t.get(m).light;g.referencePosition.value.setFromMatrixPosition(y.matrixWorld),g.nearDistance.value=y.shadow.camera.near,g.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function AS(s,t,e,i){let n={},r={},a=[],o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,M){let S=M.program;i.uniformBlockBinding(x,S)}function c(x,M){let S=n[x.id];S===void 0&&(g(x),S=h(x),n[x.id]=S,x.addEventListener("dispose",y));let A=M.program;i.updateUBOMapping(x,A);let v=t.render.frame;r[x.id]!==v&&(u(x),r[x.id]=v)}function h(x){let M=d();x.__bindingPointIndex=M;let S=s.createBuffer(),A=x.__size,v=x.usage;return s.bindBuffer(s.UNIFORM_BUFFER,S),s.bufferData(s.UNIFORM_BUFFER,A,v),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,M,S),S}function d(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return Dt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(x){let M=n[x.id],S=x.uniforms,A=x.__cache;s.bindBuffer(s.UNIFORM_BUFFER,M);for(let v=0,E=S.length;v<E;v++){let P=S[v];if(Array.isArray(P))for(let I=0,F=P.length;I<F;I++)f(P[I],v,I,A);else f(P,v,0,A)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(x,M,S,A){if(_(x,M,S,A)===!0){let v=x.__offset,E=x.value;if(Array.isArray(E)){let P=0;for(let I=0;I<E.length;I++){let F=E[I],B=m(F);p(F,x.__data,P),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(P+=B.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(E,x.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,v,x.__data)}}function p(x,M,S){typeof x=="number"||typeof x=="boolean"?M[0]=x:x.isMatrix3?(M[0]=x.elements[0],M[1]=x.elements[1],M[2]=x.elements[2],M[3]=0,M[4]=x.elements[3],M[5]=x.elements[4],M[6]=x.elements[5],M[7]=0,M[8]=x.elements[6],M[9]=x.elements[7],M[10]=x.elements[8],M[11]=0):ArrayBuffer.isView(x)?M.set(new x.constructor(x.buffer,x.byteOffset,M.length)):x.toArray(M,S)}function _(x,M,S,A){let v=x.value,E=M+"_"+S;if(A[E]===void 0)return typeof v=="number"||typeof v=="boolean"?A[E]=v:ArrayBuffer.isView(v)?A[E]=v.slice():A[E]=v.clone(),!0;{let P=A[E];if(typeof v=="number"||typeof v=="boolean"){if(P!==v)return A[E]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(P.equals(v)===!1)return P.copy(v),!0}}return!1}function g(x){let M=x.uniforms,S=0,A=16;for(let E=0,P=M.length;E<P;E++){let I=Array.isArray(M[E])?M[E]:[M[E]];for(let F=0,B=I.length;F<B;F++){let D=I[F],z=Array.isArray(D.value)?D.value:[D.value];for(let X=0,W=z.length;X<W;X++){let rt=z[X],Y=m(rt),tt=S%A,nt=tt%Y.boundary,Ut=tt+nt;S+=nt,Ut!==0&&A-Ut<Y.storage&&(S+=A-Ut),D.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=S,S+=Y.storage}}}let v=S%A;return v>0&&(S+=A-v),x.__size=S,x.__cache={},this}function m(x){let M={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(M.boundary=4,M.storage=4):x.isVector2?(M.boundary=8,M.storage=8):x.isVector3||x.isColor?(M.boundary=16,M.storage=12):x.isVector4?(M.boundary=16,M.storage=16):x.isMatrix3?(M.boundary=48,M.storage=48):x.isMatrix4?(M.boundary=64,M.storage=64):x.isTexture?pt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(M.boundary=16,M.storage=x.byteLength):pt("WebGLRenderer: Unsupported uniform value type.",x),M}function y(x){let M=x.target;M.removeEventListener("dispose",y);let S=a.indexOf(M.__bindingPointIndex);a.splice(S,1),s.deleteBuffer(n[M.id]),delete n[M.id],delete r[M.id]}function w(){for(let x in n)s.deleteBuffer(n[x]);a=[],n={},r={}}return{bind:l,update:c,dispose:w}}var CS=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Mn=null;function RS(){return Mn===null&&(Mn=new ui(CS,16,16,zn,$e),Mn.name="DFG_LUT",Mn.minFilter=Se,Mn.magFilter=Se,Mn.wrapS=hi,Mn.wrapT=hi,Mn.generateMipmaps=!1,Mn.needsUpdate=!0),Mn}var ac=class{constructor(t={}){let{canvas:e=Pf(),context:i=null,depth:n=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=pi}=t;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=a;let _=f,g=new Set([yl,vl,wa]),m=new Set([pi,Pi,sr,rr,gl,_l]),y=new Uint32Array(4),w=new Int32Array(4),x=new C,M=null,S=null,A=[],v=[],E=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Wi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,I=!1,F=null,B=null,D=null,z=null;this._outputColorSpace=Be;let X=0,W=0,rt=null,Y=-1,tt=null,nt=new ge,Ut=new ge,Rt=null,ue=new at(0),ie=0,ae=e.width,J=e.height,et=1,bt=null,Wt=null,Et=new ge(0,0,ae,J),qt=new ge(0,0,ae,J),_e=!1,it=new dn,ot=!1,lt=!1,ct=new Ht,ft=new C,Vt=new ge,zt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Yt=!1;function $t(){return rt===null?et:1}let L=i;function de(T,N){return e.getContext(T,N)}let ne,R,b,O,G,Z,ht,dt,$,Q,mt,Ft,Mt,gt,Ot,Gt,Jt,U,_t,K,xt,Tt,st;try{let T={alpha:!0,depth:n,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Me,!1),e.addEventListener("webglcontextrestored",fe,!1),e.addEventListener("webglcontextcreationerror",Xi,!1),L===null){let N="webgl2";if(L=de(N,T),L===null)throw de(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Bt()}catch(T){throw e.removeEventListener("webglcontextlost",Me,!1),e.removeEventListener("webglcontextrestored",fe,!1),e.removeEventListener("webglcontextcreationerror",Xi,!1),Dt("WebGLRenderer: "+T.message),T}function Bt(){ne=new OM(L),ne.init(),xt=new u0(L,ne),R=new AM(L,ne,t,xt),b=new MS(L,ne),R.reversedDepthBuffer&&u&&b.buffers.depth.setReversed(!0),B=L.createFramebuffer(),D=L.createFramebuffer(),z=L.createFramebuffer(),O=new kM(L),G=new oS,Z=new bS(L,ne,b,G,R,xt,O),ht=new FM(P),dt=new Gx(L),Tt=new TM(L,dt),$=new BM(L,dt,O,Tt),Q=new GM(L,$,dt,Tt,O),U=new VM(L,R,Z),Ot=new CM(G),mt=new aS(P,ht,ne,R,Tt,Ot),Ft=new ES(P,G),Mt=new cS,gt=new mS(ne),Jt=new wM(P,ht,b,Q,p,l),Gt=new yS(P,Q,R),st=new AS(L,O,R,b),_t=new EM(L,ne,O),K=new zM(L,ne,O),O.programs=mt.programs,P.capabilities=R,P.extensions=ne,P.properties=G,P.renderLists=Mt,P.shadowMap=Gt,P.state=b,P.info=O}_!==pi&&(E=new WM(_,e.width,e.height,o,n,r));let Lt=new Kf(P,L);this.xr=Lt,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let T=ne.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=ne.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return et},this.setPixelRatio=function(T){T!==void 0&&(et=T,this.setSize(ae,J,!1))},this.getSize=function(T){return T.set(ae,J)},this.setSize=function(T,N,H=!0){if(Lt.isPresenting){pt("WebGLRenderer: Can't change size while VR device is presenting.");return}ae=T,J=N,e.width=Math.floor(T*et),e.height=Math.floor(N*et),H===!0&&(e.style.width=T+"px",e.style.height=N+"px"),E!==null&&E.setSize(e.width,e.height),this.setViewport(0,0,T,N)},this.getDrawingBufferSize=function(T){return T.set(ae*et,J*et).floor()},this.setDrawingBufferSize=function(T,N,H){ae=T,J=N,et=H,e.width=Math.floor(T*H),e.height=Math.floor(N*H),this.setViewport(0,0,T,N)},this.setEffects=function(T){if(_===pi){Dt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let N=0;N<T.length;N++)if(T[N].isOutputPass===!0){pt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(nt)},this.getViewport=function(T){return T.copy(Et)},this.setViewport=function(T,N,H,k){T.isVector4?Et.set(T.x,T.y,T.z,T.w):Et.set(T,N,H,k),b.viewport(nt.copy(Et).multiplyScalar(et).round())},this.getScissor=function(T){return T.copy(qt)},this.setScissor=function(T,N,H,k){T.isVector4?qt.set(T.x,T.y,T.z,T.w):qt.set(T,N,H,k),b.scissor(Ut.copy(qt).multiplyScalar(et).round())},this.getScissorTest=function(){return _e},this.setScissorTest=function(T){b.setScissorTest(_e=T)},this.setOpaqueSort=function(T){bt=T},this.setTransparentSort=function(T){Wt=T},this.getClearColor=function(T){return T.copy(Jt.getClearColor())},this.setClearColor=function(){Jt.setClearColor(...arguments)},this.getClearAlpha=function(){return Jt.getClearAlpha()},this.setClearAlpha=function(){Jt.setClearAlpha(...arguments)},this.clear=function(T=!0,N=!0,H=!0){let k=0;if(T){let V=!1;if(rt!==null){let wt=rt.texture.format;V=g.has(wt)}if(V){let wt=rt.texture.type,Ct=m.has(wt),St=Jt.getClearColor(),Pt=Jt.getClearAlpha(),Nt=St.r,Qt=St.g,se=St.b;Ct?(y[0]=Nt,y[1]=Qt,y[2]=se,y[3]=Pt,L.clearBufferuiv(L.COLOR,0,y)):(w[0]=Nt,w[1]=Qt,w[2]=se,w[3]=Pt,L.clearBufferiv(L.COLOR,0,w))}else k|=L.COLOR_BUFFER_BIT}N&&(k|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),H&&(k|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&L.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),F=T},this.dispose=function(){e.removeEventListener("webglcontextlost",Me,!1),e.removeEventListener("webglcontextrestored",fe,!1),e.removeEventListener("webglcontextcreationerror",Xi,!1),Jt.dispose(),Mt.dispose(),gt.dispose(),G.dispose(),ht.dispose(),Q.dispose(),Tt.dispose(),st.dispose(),mt.dispose(),Lt.dispose(),Lt.removeEventListener("sessionstart",up),Lt.removeEventListener("sessionend",dp),gs.stop()};function Me(T){T.preventDefault(),Gr("WebGLRenderer: Context Lost."),I=!0}function fe(){Gr("WebGLRenderer: Context Restored."),I=!1;let T=O.autoReset,N=Gt.enabled,H=Gt.autoUpdate,k=Gt.needsUpdate,V=Gt.type;Bt(),O.autoReset=T,Gt.enabled=N,Gt.autoUpdate=H,Gt.needsUpdate=k,Gt.type=V}function Xi(T){Dt("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function ln(T){let N=T.target;N.removeEventListener("dispose",ln),F0(N)}function F0(T){O0(T),G.remove(T)}function O0(T){let N=G.get(T).programs;N!==void 0&&(N.forEach(function(H){mt.releaseProgram(H)}),T.isShaderMaterial&&mt.releaseShaderCache(T))}this.renderBufferDirect=function(T,N,H,k,V,wt){N===null&&(N=zt);let Ct=V.isMesh&&V.matrixWorld.determinantAffine()<0,St=k0(T,N,H,k,V);b.setMaterial(k,Ct);let Pt=H.index,Nt=1;if(k.wireframe===!0){if(Pt=$.getWireframeAttribute(H),Pt===void 0)return;Nt=2}let Qt=H.drawRange,se=H.attributes.position,It=Qt.start*Nt,pe=(Qt.start+Qt.count)*Nt;wt!==null&&(It=Math.max(It,wt.start*Nt),pe=Math.min(pe,(wt.start+wt.count)*Nt)),Pt!==null?(It=Math.max(It,0),pe=Math.min(pe,Pt.count)):se!=null&&(It=Math.max(It,0),pe=Math.min(pe,se.count));let Fe=pe-It;if(Fe<0||Fe===1/0)return;Tt.setup(V,k,St,H,Pt);let we,ye=_t;if(Pt!==null&&(we=dt.get(Pt),ye=K,ye.setIndex(we)),V.isMesh)k.wireframe===!0?(b.setLineWidth(k.wireframeLinewidth*$t()),ye.setMode(L.LINES)):ye.setMode(L.TRIANGLES);else if(V.isLine){let Qe=k.linewidth;Qe===void 0&&(Qe=1),b.setLineWidth(Qe*$t()),V.isLineSegments?ye.setMode(L.LINES):V.isLineLoop?ye.setMode(L.LINE_LOOP):ye.setMode(L.LINE_STRIP)}else V.isPoints?ye.setMode(L.POINTS):V.isSprite&&ye.setMode(L.TRIANGLES);if(V.isBatchedMesh)if(ne.get("WEBGL_multi_draw"))ye.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let Qe=V._multiDrawStarts,At=V._multiDrawCounts,oi=V._multiDrawCount,oe=Pt?dt.get(Pt).bytesPerElement:1,Di=G.get(k).currentProgram.getUniforms();for(let cn=0;cn<oi;cn++)Di.setValue(L,"_gl_DrawID",cn),ye.render(Qe[cn]/oe,At[cn])}else if(V.isInstancedMesh)ye.renderInstances(It,Fe,V.count);else if(H.isInstancedBufferGeometry){let Qe=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,At=Math.min(H.instanceCount,Qe);ye.renderInstances(It,Fe,At)}else ye.render(It,Fe)};function hp(T,N,H,k){F!==null&&T.isNodeMaterial&&F.setObject(k,T),ot===!0&&Ot.setState(T,H,!1),T.transparent===!0&&T.side===fi&&T.forceSinglePass===!1?(T.side=ri,T.needsUpdate=!0,pc(T,N,k),T.side=Un,T.needsUpdate=!0,pc(T,N,k),T.side=fi):pc(T,N,k)}this.compile=function(T,N,H=null){H===null&&(H=T),F!==null&&F.renderStart(T,N,H),S=gt.get(H),S.init(N),v.push(S),H.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),T!==H&&T.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),S.setupLights(),F!==null&&F.updateLights(S.state.lightsArray),lt=this.localClippingEnabled,ot=Ot.init(this.clippingPlanes,lt),ot===!0&&Ot.setGlobalState(this.clippingPlanes,N),F!==null&&Gt.render(S.state.shadowsArray,H,N);let k=new Set;return T.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let wt=V.material;if(wt)if(Array.isArray(wt))for(let Ct=0;Ct<wt.length;Ct++){let St=wt[Ct];hp(St,H,N,V),k.add(St)}else hp(wt,H,N,V),k.add(wt)}),S=v.pop(),F!==null&&F.renderEnd(),k},this.compileAsync=function(T,N,H=null){let k=this.compile(T,N,H);return new Promise(V=>{function wt(){if(k.forEach(function(Ct){let Pt=G.get(Ct).currentProgram;(Pt===void 0||Pt.isReady())&&k.delete(Ct)}),k.size===0){V(T);return}setTimeout(wt,10)}ne.get("KHR_parallel_shader_compile")!==null?wt():setTimeout(wt,10)})};let $u=null;function B0(T){$u&&$u(T)}function up(){gs.stop()}function dp(){gs.start()}let gs=new r0;gs.setAnimationLoop(B0),typeof self<"u"&&gs.setContext(self),this.setAnimationLoop=function(T){$u=T,Lt.setAnimationLoop(T),T===null?gs.stop():gs.start()},Lt.addEventListener("sessionstart",up),Lt.addEventListener("sessionend",dp),this.render=function(T,N){if(N!==void 0&&N.isCamera!==!0){Dt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;F!==null&&F.renderStart(T,N);let H=Lt.enabled===!0&&Lt.isPresenting===!0,k=E!==null&&(rt===null||H)&&E.begin(P,rt);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Lt.enabled===!0&&Lt.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(Lt.cameraAutoUpdate===!0&&Lt.updateCamera(N),N=Lt.getCamera()),T.isScene===!0&&T.onBeforeRender(P,T,N,rt),S=gt.get(T,v.length),S.init(N),S.state.textureUnits=Z.getTextureUnits(),v.push(S),ct.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),it.setFromProjectionMatrix(ct,xi,N.reversedDepth),lt=this.localClippingEnabled,ot=Ot.init(this.clippingPlanes,lt),M=Mt.get(T,A.length),M.init(),A.push(M),Lt.enabled===!0&&Lt.isPresenting===!0){let Ct=P.xr.getDepthSensingMesh();Ct!==null&&Ju(Ct,N,-1/0,P.sortObjects)}Ju(T,N,0,P.sortObjects),M.finish(),F!==null&&F.updateLights(S.state.lightsArray),P.sortObjects===!0&&M.sort(bt,Wt),Yt=Lt.enabled===!1||Lt.isPresenting===!1||Lt.hasDepthSensing()===!1,Yt&&Jt.addToRenderList(M,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ot===!0&&Ot.beginShadows();let V=S.state.shadowsArray;if(Gt.render(V,T,N),ot===!0&&Ot.endShadows(),(k&&E.hasRenderPass())===!1){let Ct=M.opaque,St=M.transmissive;if(S.setupLights(),N.isArrayCamera){let Pt=N.cameras;if(St.length>0)for(let Nt=0,Qt=Pt.length;Nt<Qt;Nt++){let se=Pt[Nt];pp(Ct,St,T,se)}Yt&&Jt.render(T);for(let Nt=0,Qt=Pt.length;Nt<Qt;Nt++){let se=Pt[Nt];fp(M,T,se,se.viewport)}}else St.length>0&&pp(Ct,St,T,N),Yt&&Jt.render(T),fp(M,T,N)}rt!==null&&W===0&&(Z.updateMultisampleRenderTarget(rt),Z.updateRenderTargetMipmap(rt)),k&&E.end(P),T.isScene===!0&&T.onAfterRender(P,T,N),Tt.resetDefaultState(),Y=-1,tt=null,v.pop(),v.length>0?(S=v[v.length-1],Z.setTextureUnits(S.state.textureUnits),ot===!0&&Ot.setGlobalState(P.clippingPlanes,S.state.camera)):S=null,A.pop(),A.length>0?M=A[A.length-1]:M=null,F!==null&&F.renderEnd()};function Ju(T,N,H,k){if(T.visible===!1)return;if(T.layers.test(N.layers)){if(T.isGroup)H=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(N);else if(T.isLightProbeGrid)S.pushLightProbeGrid(T);else if(T.isLight)S.pushLight(T),T.castShadow&&S.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||T.intersectsFrustum(it)){k&&Vt.setFromMatrixPosition(T.matrixWorld).applyMatrix4(ct);let Ct=Q.update(T),St=T.material;St.visible&&M.push(T,Ct,St,H,Vt.z,null,N)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||T.intersectsFrustum(it))){let Ct=Q.update(T),St=T.material;if(k&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Vt.copy(T.boundingSphere.center)):(Ct.boundingSphere===null&&Ct.computeBoundingSphere(),Vt.copy(Ct.boundingSphere.center)),Vt.applyMatrix4(T.matrixWorld).applyMatrix4(ct)),Array.isArray(St)){let Pt=Ct.groups;for(let Nt=0,Qt=Pt.length;Nt<Qt;Nt++){let se=Pt[Nt],It=St[se.materialIndex];It&&It.visible&&M.push(T,Ct,It,H,Vt.z,se,N)}}else St.visible&&M.push(T,Ct,St,H,Vt.z,null,N)}}let wt=T.children;for(let Ct=0,St=wt.length;Ct<St;Ct++)Ju(wt[Ct],N,H,k)}function fp(T,N,H,k){let{opaque:V,transmissive:wt,transparent:Ct}=T;S.setupLightsView(H),ot===!0&&Ot.setGlobalState(P.clippingPlanes,H),k&&b.viewport(nt.copy(k)),V.length>0&&fc(V,N,H),wt.length>0&&fc(wt,N,H),Ct.length>0&&fc(Ct,N,H),b.buffers.depth.setTest(!0),b.buffers.depth.setMask(!0),b.buffers.color.setMask(!0),b.setPolygonOffset(!1)}function pp(T,N,H,k){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[k.id]===void 0){let It=ne.has("EXT_color_buffer_half_float")||ne.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[k.id]=new Ae(1,1,{generateMipmaps:!0,type:It?$e:pi,minFilter:rn,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:te.workingColorSpace})}let wt=S.state.transmissionRenderTarget[k.id],Ct=k.viewport||nt;wt.setSize(Ct.z*P.transmissionResolutionScale,Ct.w*P.transmissionResolutionScale);let St=P.getRenderTarget(),Pt=P.getActiveCubeFace(),Nt=P.getActiveMipmapLevel();P.setRenderTarget(wt),P.getClearColor(ue),ie=P.getClearAlpha(),ie<1&&P.setClearColor(16777215,.5),P.clear(),Yt&&Jt.render(H);let Qt=P.toneMapping;P.toneMapping=Wi;let se=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),S.setupLightsView(k),ot===!0&&Ot.setGlobalState(P.clippingPlanes,k),fc(T,H,k),Z.updateMultisampleRenderTarget(wt),Z.updateRenderTargetMipmap(wt),ne.has("WEBGL_multisampled_render_to_texture")===!1){let It=!1;for(let pe=0,Fe=N.length;pe<Fe;pe++){let we=N[pe],{object:ye,geometry:Qe,material:At,group:oi}=we;if(At.side===fi&&ye.layers.test(k.layers)){let oe=At.side;At.side=ri,At.needsUpdate=!0,mp(ye,H,k,Qe,At,oi),At.side=oe,At.needsUpdate=!0,It=!0}}It===!0&&(Z.updateMultisampleRenderTarget(wt),Z.updateRenderTargetMipmap(wt))}P.setRenderTarget(St,Pt,Nt),P.setClearColor(ue,ie),se!==void 0&&(k.viewport=se),P.toneMapping=Qt}function fc(T,N,H){let k=N.isScene===!0?N.overrideMaterial:null;for(let V=0,wt=T.length;V<wt;V++){let Ct=T[V],{object:St,geometry:Pt,group:Nt}=Ct,Qt=Ct.material;Qt.allowOverride===!0&&k!==null&&(Qt=k),St.layers.test(H.layers)&&mp(St,N,H,Pt,Qt,Nt)}}function mp(T,N,H,k,V,wt){F!==null&&V.isNodeMaterial&&F.setObject(T,V),T.onBeforeRender(P,N,H,k,V,wt),T.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),V.onBeforeRender(P,N,H,k,T,wt),V.transparent===!0&&V.side===fi&&V.forceSinglePass===!1?(V.side=ri,V.needsUpdate=!0,P.renderBufferDirect(H,N,k,V,T,wt),V.side=Un,V.needsUpdate=!0,P.renderBufferDirect(H,N,k,V,T,wt),V.side=fi):P.renderBufferDirect(H,N,k,V,T,wt),T.onAfterRender(P,N,H,k,V,wt)}function pc(T,N,H){N.isScene!==!0&&(N=zt);let k=G.get(T),V=S.state.lights,wt=S.state.shadowsArray,Ct=V.state.version,St=mt.getParameters(T,V.state,wt,N,H,S.state.lightProbeGridArray),Pt=mt.getProgramCacheKey(St),Nt=k.programs;k.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?N.environment:null,k.fog=N.fog;let Qt=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;k.envMap=ht.get(T.envMap||k.environment,Qt),k.envMapRotation=k.environment!==null&&T.envMap===null?N.environmentRotation:T.envMapRotation,Nt===void 0&&(T.addEventListener("dispose",ln),Nt=new Map,k.programs=Nt);let se=Nt.get(Pt);if(se!==void 0){if(k.currentProgram===se&&k.lightsStateVersion===Ct)return _p(T,St),se}else St.uniforms=mt.getUniforms(T),F!==null&&T.isNodeMaterial&&F.build(T,H,St),T.onBeforeCompile(St,P),se=mt.acquireProgram(St,Pt),Nt.set(Pt,se),k.uniforms=St.uniforms;let It=k.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(It.clippingPlanes=Ot.uniform),_p(T,St),k.needsLights=G0(T),k.lightsStateVersion=Ct,k.needsLights&&(It.ambientLightColor.value=V.state.ambient,It.lightProbe.value=V.state.probe,It.sunLights.value=V.state.sun,It.sunLightShadows.value=V.state.sunShadow,It.directionalLights.value=V.state.directional,It.directionalLightShadows.value=V.state.directionalShadow,It.spotLights.value=V.state.spot,It.spotLightShadows.value=V.state.spotShadow,It.rectAreaLights.value=V.state.rectArea,It.ltc_1.value=V.state.rectAreaLTC1,It.ltc_2.value=V.state.rectAreaLTC2,It.pointLights.value=V.state.point,It.pointLightShadows.value=V.state.pointShadow,It.hemisphereLights.value=V.state.hemi,It.sunShadowMatrix.value=V.state.sunShadowMatrix,It.sunShadowCascade.value=V.state.sunShadowCascade,It.directionalShadowMatrix.value=V.state.directionalShadowMatrix,It.spotLightMatrix.value=V.state.spotLightMatrix,It.spotLightMap.value=V.state.spotLightMap,It.pointShadowMatrix.value=V.state.pointShadowMatrix),k.lightProbeGrid=S.state.lightProbeGridArray.length>0,k.currentProgram=se,k.uniformsList=null,se}function gp(T){if(T.uniformsList===null){let N=T.currentProgram.getUniforms();T.uniformsList=Na.seqWithValue(N.seq,T.uniforms)}return T.uniformsList}function _p(T,N){let H=G.get(T);H.outputColorSpace=N.outputColorSpace,H.batching=N.batching,H.batchingColor=N.batchingColor,H.instancing=N.instancing,H.instancingColor=N.instancingColor,H.instancingMorph=N.instancingMorph,H.skinning=N.skinning,H.morphTargets=N.morphTargets,H.morphNormals=N.morphNormals,H.morphColors=N.morphColors,H.morphTargetsCount=N.morphTargetsCount,H.numClippingPlanes=N.numClippingPlanes,H.numIntersection=N.numClipIntersection,H.vertexAlphas=N.vertexAlphas,H.vertexTangents=N.vertexTangents,H.toneMapping=N.toneMapping}function z0(T,N){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;x.setFromMatrixPosition(N.matrixWorld);for(let H=0,k=T.length;H<k;H++){let V=T[H];if(V.texture!==null&&V.boundingBox.containsPoint(x))return V}return null}function k0(T,N,H,k,V){N.isScene!==!0&&(N=zt),Z.resetTextureUnits();let wt=N.fog,Ct=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?N.environment:null,St=rt===null?P.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:te.workingColorSpace,Pt=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Nt=ht.get(k.envMap||Ct,Pt),Qt=k.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,se=!!H.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),It=!!H.morphAttributes.position,pe=!!H.morphAttributes.normal,Fe=!!H.morphAttributes.color,we=Wi;k.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&(we=P.toneMapping);let ye=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,Qe=ye!==void 0?ye.length:0,At=G.get(k),oi=S.state.lights;if(ot===!0&&(lt===!0||T!==tt)){let be=T===tt&&k.id===Y;Ot.setState(k,T,be)}let oe=!1;k.version===At.__version?(At.needsLights&&At.lightsStateVersion!==oi.state.version||At.outputColorSpace!==St||V.isBatchedMesh&&At.batching===!1||!V.isBatchedMesh&&At.batching===!0||V.isBatchedMesh&&At.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&At.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&At.instancing===!1||!V.isInstancedMesh&&At.instancing===!0||V.isSkinnedMesh&&At.skinning===!1||!V.isSkinnedMesh&&At.skinning===!0||V.isInstancedMesh&&At.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&At.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&At.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&At.instancingMorph===!1&&V.morphTexture!==null||At.envMap!==Nt||k.fog===!0&&At.fog!==wt||At.numClippingPlanes!==void 0&&(At.numClippingPlanes!==Ot.numPlanes||At.numIntersection!==Ot.numIntersection)||At.vertexAlphas!==Qt||At.vertexTangents!==se||At.morphTargets!==It||At.morphNormals!==pe||At.morphColors!==Fe||At.toneMapping!==we||At.morphTargetsCount!==Qe||!!At.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(oe=!0):(oe=!0,At.__version=k.version);let Di=At.currentProgram;oe===!0&&(Di=pc(k,N,V),F&&k.isNodeMaterial&&F.onUpdateProgram(k,Di,At));let cn=!1,Vn=!1,hr=!1,ve=Di.getUniforms(),Ne=At.uniforms;if(b.useProgram(Di.program)&&(cn=!0,Vn=!0,hr=!0),k.id!==Y&&(Y=k.id,Vn=!0),At.needsLights){let be=z0(S.state.lightProbeGridArray,V);At.lightProbeGrid!==be&&(At.lightProbeGrid=be,Vn=!0)}if(cn||tt!==T){b.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),ve.setValue(L,"projectionMatrix",T.projectionMatrix),ve.setValue(L,"viewMatrix",T.matrixWorldInverse);let Hn=ve.map.cameraPosition;Hn!==void 0&&Hn.setValue(L,ft.setFromMatrixPosition(T.matrixWorld)),R.logarithmicDepthBuffer&&ve.setValue(L,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&ve.setValue(L,"isOrthographic",T.isOrthographicCamera===!0),tt!==T&&(tt=T,Vn=!0,hr=!0)}if(At.needsLights&&(oi.state.sunShadowMap.length>0&&ve.setValue(L,"sunShadowMap",oi.state.sunShadowMap,Z),oi.state.directionalShadowMap.length>0&&ve.setValue(L,"directionalShadowMap",oi.state.directionalShadowMap,Z),oi.state.spotShadowMap.length>0&&ve.setValue(L,"spotShadowMap",oi.state.spotShadowMap,Z),oi.state.pointShadowMap.length>0&&ve.setValue(L,"pointShadowMap",oi.state.pointShadowMap,Z)),V.isSkinnedMesh){ve.setOptional(L,V,"bindMatrix"),ve.setOptional(L,V,"bindMatrixInverse");let be=V.skeleton;be&&(be.boneTexture===null&&be.computeBoneTexture(),ve.setValue(L,"boneTexture",be.boneTexture,Z))}V.isBatchedMesh&&(ve.setOptional(L,V,"batchingTexture"),ve.setValue(L,"batchingTexture",V._matricesTexture,Z),ve.setOptional(L,V,"batchingIdTexture"),ve.setValue(L,"batchingIdTexture",V._indirectTexture,Z),ve.setOptional(L,V,"batchingColorTexture"),V._colorsTexture!==null&&ve.setValue(L,"batchingColorTexture",V._colorsTexture,Z));let Gn=H.morphAttributes;if((Gn.position!==void 0||Gn.normal!==void 0||Gn.color!==void 0)&&U.update(V,H,Di),(Vn||At.receiveShadow!==V.receiveShadow)&&(At.receiveShadow=V.receiveShadow,ve.setValue(L,"receiveShadow",V.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&N.environment!==null&&(Ne.envMapIntensity.value=N.environmentIntensity),Ne.dfgLUT!==void 0&&(Ne.dfgLUT.value=RS()),Vn){if(ve.setValue(L,"toneMappingExposure",P.toneMappingExposure),At.needsLights&&V0(Ne,hr),wt&&k.fog===!0&&Ft.refreshFogUniforms(Ne,wt),Ft.refreshMaterialUniforms(Ne,k,et,J,S.state.transmissionRenderTarget[T.id]),At.needsLights&&At.lightProbeGrid){let be=At.lightProbeGrid;Ne.probesSH.value=be.texture,Ne.probesMin.value.copy(be.boundingBox.min),Ne.probesMax.value.copy(be.boundingBox.max),Ne.probesResolution.value.copy(be.resolution)}Na.upload(L,gp(At),Ne,Z)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Na.upload(L,gp(At),Ne,Z),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&ve.setValue(L,"center",V.center),ve.setValue(L,"modelViewMatrix",V.modelViewMatrix),ve.setValue(L,"normalMatrix",V.normalMatrix),ve.setValue(L,"modelMatrix",V.matrixWorld),k.uniformsGroups!==void 0){let be=k.uniformsGroups;for(let Hn=0,ur=be.length;Hn<ur;Hn++){let vp=be[Hn];st.update(vp,Di),st.bind(vp,Di)}}return Di}function V0(T,N){T.ambientLightColor.needsUpdate=N,T.lightProbe.needsUpdate=N,T.sunLights.needsUpdate=N,T.sunLightShadows.needsUpdate=N,T.directionalLights.needsUpdate=N,T.directionalLightShadows.needsUpdate=N,T.pointLights.needsUpdate=N,T.pointLightShadows.needsUpdate=N,T.spotLights.needsUpdate=N,T.spotLightShadows.needsUpdate=N,T.rectAreaLights.needsUpdate=N,T.hemisphereLights.needsUpdate=N}function G0(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return rt},this.setRenderTargetTextures=function(T,N,H){let k=G.get(T);k.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),G.get(T.texture).__webglTexture=N,G.get(T.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:H,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,N){let H=G.get(T);H.__webglFramebuffer=N,H.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(T,N=0,H=0){rt=T,X=N,W=H;let k=null,V=!1,wt=!1;if(T){let St=G.get(T);if(St.__useDefaultFramebuffer!==void 0){b.bindFramebuffer(L.FRAMEBUFFER,St.__webglFramebuffer),nt.copy(T.viewport),Ut.copy(T.scissor),Rt=T.scissorTest,b.viewport(nt),b.scissor(Ut),b.setScissorTest(Rt),Y=-1;return}else if(St.__webglFramebuffer===void 0)Z.setupRenderTarget(T);else if(St.__hasExternalTextures)Z.rebindTextures(T,G.get(T.texture).__webglTexture,G.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Qt=T.depthTexture;if(St.__boundDepthTexture!==Qt){if(Qt!==null&&G.has(Qt)&&(T.width!==Qt.image.width||T.height!==Qt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(T)}}let Pt=T.texture;(Pt.isData3DTexture||Pt.isDataArrayTexture||Pt.isCompressedArrayTexture)&&(wt=!0);let Nt=G.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Nt[N])?k=Nt[N][H]:k=Nt[N],V=!0):T.samples>0&&Z.useMultisampledRTT(T)===!1?k=G.get(T).__webglMultisampledFramebuffer:Array.isArray(Nt)?k=Nt[H]:k=Nt,nt.copy(T.viewport),Ut.copy(T.scissor),Rt=T.scissorTest}else nt.copy(Et).multiplyScalar(et).floor(),Ut.copy(qt).multiplyScalar(et).floor(),Rt=_e;if(H!==0&&(k=B),b.bindFramebuffer(L.FRAMEBUFFER,k)&&b.drawBuffers(T,k),b.viewport(nt),b.scissor(Ut),b.setScissorTest(Rt),V){let St=G.get(T.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,St.__webglTexture,H)}else if(wt){let St=N;for(let Pt=0;Pt<T.textures.length;Pt++){let Nt=G.get(T.textures[Pt]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Pt,Nt.__webglTexture,H,St)}}else if(T!==null&&H!==0){let St=G.get(T.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,St.__webglTexture,H)}Y=-1};function xp(T){let N=G.get(T);return(N.__readFormat!==T.format||N.__readType!==T.type)&&(N.__readFormat=T.format,N.__readType=T.type,N.__formatReadable=R.textureFormatReadable(T.format),N.__typeReadable=R.textureTypeReadable(T.type)),N}this.readRenderTargetPixels=function(T,N,H,k,V,wt,Ct,St=0){if(!(T&&T.isWebGLRenderTarget)){Dt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pt=G.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ct!==void 0&&(Pt=Pt[Ct]),Pt){b.bindFramebuffer(L.FRAMEBUFFER,Pt);try{let Nt=T.textures[St],Qt=Nt.format,se=Nt.type;T.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+St);let It=xp(Nt);if(It.__formatReadable===!1){Dt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(It.__typeReadable===!1){Dt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=T.width-k&&H>=0&&H<=T.height-V&&L.readPixels(N,H,k,V,xt.convert(Qt),xt.convert(se),wt)}finally{let Nt=rt!==null?G.get(rt).__webglFramebuffer:null;b.bindFramebuffer(L.FRAMEBUFFER,Nt)}}},this.readRenderTargetPixelsAsync=async function(T,N,H,k,V,wt,Ct,St=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Pt=G.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ct!==void 0&&(Pt=Pt[Ct]),Pt)if(N>=0&&N<=T.width-k&&H>=0&&H<=T.height-V){b.bindFramebuffer(L.FRAMEBUFFER,Pt);let Nt=T.textures[St],Qt=Nt.format,se=Nt.type;T.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+St);let It=xp(Nt);if(It.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(It.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let pe=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,pe),L.bufferData(L.PIXEL_PACK_BUFFER,wt.byteLength,L.STREAM_READ),L.readPixels(N,H,k,V,xt.convert(Qt),xt.convert(se),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let Fe=rt!==null?G.get(rt).__webglFramebuffer:null;b.bindFramebuffer(L.FRAMEBUFFER,Fe);let we=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Eg(L,we,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,pe),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,wt),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(pe),L.deleteSync(we),wt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,N=null,H=0){let k=Math.pow(2,-H),V=Math.floor(T.image.width*k),wt=Math.floor(T.image.height*k),Ct=N!==null?N.x:0,St=N!==null?N.y:0;Z.setTexture2D(T,0),L.copyTexSubImage2D(L.TEXTURE_2D,H,0,0,Ct,St,V,wt),b.unbindTexture()},this.copyTextureToTexture=function(T,N,H=null,k=null,V=0,wt=0){let Ct,St,Pt,Nt,Qt,se,It,pe,Fe,we=T.isCompressedTexture?T.mipmaps[wt]:T.image;if(H!==null)Ct=H.max.x-H.min.x,St=H.max.y-H.min.y,Pt=H.isBox3?H.max.z-H.min.z:1,Nt=H.min.x,Qt=H.min.y,se=H.isBox3?H.min.z:0;else{let Ne=Math.pow(2,-V);Ct=Math.floor(we.width*Ne),St=Math.floor(we.height*Ne),T.isDataArrayTexture?Pt=we.depth:T.isData3DTexture?Pt=Math.floor(we.depth*Ne):Pt=1,Nt=0,Qt=0,se=0}k!==null?(It=k.x,pe=k.y,Fe=k.z):(It=0,pe=0,Fe=0);let ye=xt.convert(N.format),Qe=xt.convert(N.type),At;N.isData3DTexture?(Z.setTexture3D(N,0),At=L.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(Z.setTexture2DArray(N,0),At=L.TEXTURE_2D_ARRAY):(Z.setTexture2D(N,0),At=L.TEXTURE_2D),b.activeTexture(L.TEXTURE0),b.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,N.flipY),b.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),b.pixelStorei(L.UNPACK_ALIGNMENT,N.unpackAlignment);let oi=b.getParameter(L.UNPACK_ROW_LENGTH),oe=b.getParameter(L.UNPACK_IMAGE_HEIGHT),Di=b.getParameter(L.UNPACK_SKIP_PIXELS),cn=b.getParameter(L.UNPACK_SKIP_ROWS),Vn=b.getParameter(L.UNPACK_SKIP_IMAGES);b.pixelStorei(L.UNPACK_ROW_LENGTH,we.width),b.pixelStorei(L.UNPACK_IMAGE_HEIGHT,we.height),b.pixelStorei(L.UNPACK_SKIP_PIXELS,Nt),b.pixelStorei(L.UNPACK_SKIP_ROWS,Qt),b.pixelStorei(L.UNPACK_SKIP_IMAGES,se);let hr=T.isDataArrayTexture||T.isData3DTexture,ve=N.isDataArrayTexture||N.isData3DTexture;if(T.isDepthTexture){let Ne=G.get(T),Gn=G.get(N),be=G.get(Ne.__renderTarget),Hn=G.get(Gn.__renderTarget);b.bindFramebuffer(L.READ_FRAMEBUFFER,be.__webglFramebuffer),b.bindFramebuffer(L.DRAW_FRAMEBUFFER,Hn.__webglFramebuffer);for(let ur=0;ur<Pt;ur++)hr&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,G.get(T).__webglTexture,V,se+ur),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,G.get(N).__webglTexture,wt,Fe+ur)),L.blitFramebuffer(Nt,Qt,Ct,St,It,pe,Ct,St,L.DEPTH_BUFFER_BIT,L.NEAREST);b.bindFramebuffer(L.READ_FRAMEBUFFER,null),b.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(V!==0||T.isRenderTargetTexture||G.has(T)){let Ne=G.get(T),Gn=G.get(N);b.bindFramebuffer(L.READ_FRAMEBUFFER,D),b.bindFramebuffer(L.DRAW_FRAMEBUFFER,z);for(let be=0;be<Pt;be++)hr?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ne.__webglTexture,V,se+be):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ne.__webglTexture,V),ve?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Gn.__webglTexture,wt,Fe+be):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Gn.__webglTexture,wt),V!==0?L.blitFramebuffer(Nt,Qt,Ct,St,It,pe,Ct,St,L.COLOR_BUFFER_BIT,L.NEAREST):ve?L.copyTexSubImage3D(At,wt,It,pe,Fe+be,Nt,Qt,Ct,St):L.copyTexSubImage2D(At,wt,It,pe,Nt,Qt,Ct,St);b.bindFramebuffer(L.READ_FRAMEBUFFER,null),b.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else ve?T.isDataTexture||T.isData3DTexture?L.texSubImage3D(At,wt,It,pe,Fe,Ct,St,Pt,ye,Qe,we.data):N.isCompressedArrayTexture?L.compressedTexSubImage3D(At,wt,It,pe,Fe,Ct,St,Pt,ye,we.data):L.texSubImage3D(At,wt,It,pe,Fe,Ct,St,Pt,ye,Qe,we):T.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,wt,It,pe,Ct,St,ye,Qe,we.data):T.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,wt,It,pe,we.width,we.height,ye,we.data):L.texSubImage2D(L.TEXTURE_2D,wt,It,pe,Ct,St,ye,Qe,we);b.pixelStorei(L.UNPACK_ROW_LENGTH,oi),b.pixelStorei(L.UNPACK_IMAGE_HEIGHT,oe),b.pixelStorei(L.UNPACK_SKIP_PIXELS,Di),b.pixelStorei(L.UNPACK_SKIP_ROWS,cn),b.pixelStorei(L.UNPACK_SKIP_IMAGES,Vn),wt===0&&N.generateMipmaps&&L.generateMipmap(At),b.unbindTexture()},this.initRenderTarget=function(T){G.get(T).__webglFramebuffer===void 0&&Z.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?Z.setTextureCube(T,0):T.isData3DTexture?Z.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?Z.setTexture2DArray(T,0):Z.setTexture2D(T,0),b.unbindTexture()},this.resetState=function(){X=0,W=0,rt=null,b.reset(),Tt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=te._getDrawingBufferColorSpace(t),e.unpackColorSpace=te._getUnpackColorSpace()}};var f0={type:"change"},Qf={type:"start"},m0={type:"end"},Cu=new Qi,p0=new _i,PS=Math.cos(70*Ia.DEG2RAD),qe=new C,bi=2*Math.PI,xe={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},jf=1e-6,Ru=class extends da{constructor(t,e=null){super(t,e),this.state=xe.NONE,this.target=new C,this.cursor=new C,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Hi.ROTATE,MIDDLE:Hi.DOLLY,RIGHT:Hi.PAN},this.touches={ONE:Mi.ROTATE,TWO:Mi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new C,this._lastQuaternion=new Te,this._lastTargetPosition=new C,this._quat=new Te().setFromUnitVectors(t.up,new C(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Qs,this._sphericalDelta=new Qs,this._scale=1,this._panOffset=new C,this._rotateStart=new q,this._rotateEnd=new q,this._rotateDelta=new q,this._panStart=new q,this._panEnd=new q,this._panDelta=new q,this._dollyStart=new q,this._dollyEnd=new q,this._dollyDelta=new q,this._dollyDirection=new C,this._mouse=new q,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=LS.bind(this),this._onPointerDown=IS.bind(this),this._onPointerUp=DS.bind(this),this._onContextMenu=kS.bind(this),this._onMouseWheel=FS.bind(this),this._onKeyDown=OS.bind(this),this._onTouchStart=BS.bind(this),this._onTouchMove=zS.bind(this),this._onMouseDown=NS.bind(this),this._onMouseMove=US.bind(this),this._interceptControlDown=VS.bind(this),this._interceptControlUp=GS.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=xe.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let t=this.domElement.getRootNode();t.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),t.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(f0),this.update(),this.state=xe.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){let e=this.object.position;qe.copy(e).sub(this.target),qe.applyQuaternion(this._quat),this._spherical.setFromVector3(qe),this.autoRotate&&this.state===xe.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,n=this.maxAzimuthAngle;isFinite(i)&&isFinite(n)&&(i<-Math.PI?i+=bi:i>Math.PI&&(i-=bi),n<-Math.PI?n+=bi:n>Math.PI&&(n-=bi),i<=n?this._spherical.theta=Math.max(i,Math.min(n,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+n)/2?Math.max(i,this._spherical.theta):Math.min(n,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(qe.setFromSpherical(this._spherical),qe.applyQuaternion(this._quatInverse),e.copy(this.target).add(qe),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=qe.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new C(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new C(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=qe.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Cu.origin.copy(this.object.position),Cu.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Cu.direction))<PS?this.object.lookAt(this.target):(p0.setFromNormalAndCoplanarPoint(this.object.up,this.target),Cu.intersectPlane(p0,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>jf||8*(1-this._lastQuaternion.dot(this.object.quaternion))>jf||this._lastTargetPosition.distanceToSquared(this.target)>jf?(this.dispatchEvent(f0),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?bi/60*this.autoRotateSpeed*t:bi/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){qe.setFromMatrixColumn(e,0),qe.multiplyScalar(-t),this._panOffset.add(qe)}_panUp(t,e){this.screenSpacePanning===!0?qe.setFromMatrixColumn(e,1):(qe.setFromMatrixColumn(e,0),qe.crossVectors(this.object.up,qe)),qe.multiplyScalar(t),this._panOffset.add(qe)}_pan(t,e){let i=this.domElement;if(this.object.isPerspectiveCamera){let n=this.object.position;qe.copy(n).sub(this.target);let r=qe.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/i.clientHeight,this.object.matrix),this._panUp(2*e*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),n=t-i.left,r=e-i.top,a=i.width,o=i.height;this._mouse.x=n/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(bi*this._rotateDelta.x/e.clientHeight),this._rotateUp(bi*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(bi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-bi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(bi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-bi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),n=.5*(t.pageY+e.y);this._rotateStart.set(i,n)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),n=.5*(t.pageY+e.y);this._panStart.set(i,n)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,n=t.pageY-e.y,r=Math.sqrt(i*i+n*n);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let i=this._getSecondPointerPosition(t),n=.5*(t.pageX+i.x),r=.5*(t.pageY+i.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(bi*this._rotateDelta.x/e.clientHeight),this._rotateUp(bi*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),n=.5*(t.pageY+e.y);this._panEnd.set(i,n)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,n=t.pageY-e.y,r=Math.sqrt(i*i+n*n);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(t.pageX+e.x)*.5,o=(t.pageY+e.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new q,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,i={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function IS(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function LS(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function DS(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(m0),this.state=xe.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function NS(s){let t;switch(s.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Hi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=xe.DOLLY;break;case Hi.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=xe.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=xe.ROTATE}break;case Hi.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=xe.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=xe.PAN}break;default:this.state=xe.NONE}this.state!==xe.NONE&&this.dispatchEvent(Qf)}function US(s){switch(this.state){case xe.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case xe.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case xe.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function FS(s){this.enabled===!1||this.enableZoom===!1||this.state!==xe.NONE||(s.preventDefault(),this.dispatchEvent(Qf),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(m0))}function OS(s){this.enabled!==!1&&this._handleKeyDown(s)}function BS(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case Mi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(s),this.state=xe.TOUCH_ROTATE;break;case Mi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(s),this.state=xe.TOUCH_PAN;break;default:this.state=xe.NONE}break;case 2:switch(this.touches.TWO){case Mi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=xe.TOUCH_DOLLY_PAN;break;case Mi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=xe.TOUCH_DOLLY_ROTATE;break;default:this.state=xe.NONE}break;default:this.state=xe.NONE}this.state!==xe.NONE&&this.dispatchEvent(Qf)}function zS(s){switch(this._trackPointer(s),this.state){case xe.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case xe.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case xe.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case xe.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=xe.NONE}}function kS(s){this.enabled!==!1&&s.preventDefault()}function VS(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function GS(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Fa={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var Ii=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},HS=new Gi(-1,1,1,-1,0,1),tp=class extends kt{constructor(){super(),this.setAttribute("position",new vt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new vt([0,2,0,0,2,0],2))}},WS=new tp,fs=class{constructor(t){this._mesh=new ee(WS,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,HS)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var Pu=class extends Ii{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof Ce?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=yn.clone(t.uniforms),this.material=new Ce({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new fs(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var oc=class extends Ii{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){let n=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(n.REPLACE,n.REPLACE,n.REPLACE),r.buffers.stencil.setFunc(n.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(n.EQUAL,1,4294967295),r.buffers.stencil.setOp(n.KEEP,n.KEEP,n.KEEP),r.buffers.stencil.setLocked(!0)}},Iu=class extends Ii{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var Lu=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let i=t.getSize(new q);this._width=i.width,this._height=i.height,e=new Ae(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:$e}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Pu(Fa),this.copyPass.material.blending=Ri,this.timer=new js}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());let e=this.renderer.getRenderTarget(),i=!1;for(let n=0,r=this.passes.length;n<r;n++){let a=this.passes[n];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(n),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),a.needsSwap){if(i){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}oc!==void 0&&(a instanceof oc?i=!0:a instanceof Iu&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new q);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let i=this._width*this._pixelRatio,n=this._height*this._pixelRatio;this.renderTarget1.setSize(i,n),this.renderTarget2.setSize(i,n);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,n)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Du=class extends Ii{constructor(t,e,i=null,n=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=i,this.clearColor=n,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new at}render(t,e,i){let n=t.autoClear;t.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),t.autoClear=n}};var g0={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new at(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Oa=class s extends Ii{constructor(t,e=1,i,n){super(),this.strength=e,this.radius=i,this.threshold=n,this.resolution=t!==void 0?new q(t.x,t.y):new q(256,256),this.clearColor=new at(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Ae(r,a,{type:$e,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let d=new Ae(r,a,{type:$e,depthBuffer:!1});d.texture.name="UnrealBloomPass.h"+h,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);let u=new Ae(r,a,{type:$e,depthBuffer:!1});u.texture.name="UnrealBloomPass.v"+h,u.texture.generateMipmaps=!1,this.renderTargetsVertical.push(u),r=Math.round(r/2),a=Math.round(a/2)}let o=g0;this.highPassUniforms=yn.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=n,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ce({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new q(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=yn.clone(Fa.uniforms),this.blendMaterial=new Ce({uniforms:this.copyUniforms,vertexShader:Fa.vertexShader,fragmentShader:Fa.fragmentShader,premultipliedAlpha:!0,blending:Fn,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new at,this._oldClearAlpha=1,this._basic=new ce,this._fsQuad=new fs(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let i=Math.round(t/2),n=Math.round(e/2);this.renderTargetBright.setSize(i,n);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,n),this.renderTargetsVertical[r].setSize(i,n),this.separableBlurMaterials[r].uniforms.invSize.value=new q(1/i,1/n),i=Math.round(i/2),n=Math.round(n/2)}render(t,e,i,n,r){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this._fsQuad.render(t),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(i),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=a}_getSeparableBlurMaterial(t){let e=[],i=t/3;for(let a=0;a<t;a++)e.push(.39894*Math.exp(-.5*a*a/(i*i))/i);let n=[],r=[];for(let a=1;a<t;a+=2){let o=e[a],l=a+1<t?e[a+1]:0,c=o+l;n.push((a*o+(a+1)*l)/c),r.push(c)}return new Ce({defines:{KERNEL_PAIRS:n.length},uniforms:{colorTexture:{value:null},invSize:{value:new q(.5,.5)},direction:{value:new q(.5,.5)},centerWeight:{value:e[0]},gaussianOffsets:{value:n},gaussianWeights:{value:r}},vertexShader:`

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

				}`})}_getCompositeMaterial(t){return new Ce({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};Oa.BlurDirectionX=new q(1,0);Oa.BlurDirectionY=new q(0,1);var lc={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var Nu=class extends Ii{constructor(){super(),this.isOutputPass=!0,this.uniforms=yn.clone(lc.uniforms),this.material=new as({name:lc.name,uniforms:this.uniforms,vertexShader:lc.vertexShader,fragmentShader:lc.fragmentShader}),this._fsQuad=new fs(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},te.getTransfer(this._outputColorSpace)===le&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ma?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ga?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===_a?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===hs?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===va?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ya?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===xa&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};function _0(s){let t=new s.Group;t.name="cosmic_environment";let e=new s.Vector3(-20,-12,-19),i=new s.SphereGeometry(6.1,64,32),n=new s.ShaderMaterial({uniforms:{uLight:{value:new s.Vector3(-.9,.48,-.25).normalize()}},vertexShader:`
      varying vec3 vLocalPosition;
      varying vec3 vWorldNormal;
      void main() {
        vLocalPosition = position;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 uLight;
      varying vec3 vLocalPosition;
      varying vec3 vWorldNormal;
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.11, 0.23, 0.37));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                       mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                       mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float terrain(vec3 p) {
        return noise(p) * 0.56 + noise(p * 2.07 + 4.2) * 0.27 + noise(p * 4.11 + 8.3) * 0.12 + noise(p * 8.2) * 0.05;
      }
      void main() {
        vec3 p = normalize(vLocalPosition);
        float ground = terrain(p * 4.7);
        float fine = noise(p * 35.0);
        float basin = smoothstep(0.38, 0.64, ground);
        vec3 ocean = vec3(0.017, 0.07, 0.11);
        vec3 rock = mix(vec3(0.10, 0.16, 0.20), vec3(0.33, 0.40, 0.44), basin);
        vec3 surface = mix(ocean, rock, smoothstep(0.43, 0.53, ground));
        surface *= 0.83 + fine * 0.32;
        float clouds = smoothstep(0.57, 0.76, terrain(p * 8.5 + vec3(2.0, 1.0, 5.0)));
        surface = mix(surface, vec3(0.53, 0.66, 0.72), clouds * 0.7);
        float light = dot(normalize(vWorldNormal), uLight);
        float day = smoothstep(-0.16, 0.72, light);
        vec3 color = surface * (0.04 + day * 0.38);
        color += vec3(0.01, 0.033, 0.05) * smoothstep(-0.25, 0.12, light) * (1.0 - day);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `}),r=new s.Mesh(i,n);r.position.copy(e),r.scale.setScalar(.85),r.rotation.set(.18,.45,-.25),t.add(r);let a=new s.ShaderMaterial({transparent:!0,depthWrite:!1,blending:s.AdditiveBlending,side:s.BackSide,uniforms:{uLight:{value:new s.Vector3(-.9,.48,-.25).normalize()}},vertexShader:`
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = cameraPosition - world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,fragmentShader:`
      uniform vec3 uLight;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 normal = normalize(vNormal);
        float edge = pow(1.0 - abs(dot(normal, normalize(vView))), 4.0);
        float sun = smoothstep(-0.45, 0.65, dot(normal, uLight));
        vec3 color = mix(vec3(0.08, 0.15, 0.34), vec3(0.28, 0.73, 0.87), sun);
        gl_FragColor = vec4(color * 1.35, edge * (0.16 + sun * 0.44));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `}),o=new s.Mesh(i,a);o.position.copy(e),o.scale.setScalar(.873),t.add(o);let l=XS(729401),c=[],h=[],d=[],u=[];for(let M=0;M<880;M++){let S=M<220,A,v,E;if(S){let F=(l()-.5)*85;A=F,v=F*.17+(l()+l()-1)*6+5,E=39+l()*14}else A=(l()-.5)*105,v=(l()-.5)*70,E=34+l()*60;c.push(A*.85-v*.332-E*.409,v*.777-E*.629,-A*.526-v*.536-E*.66);let P=l()<.34,I=S?.1+l()*.12:.55+Math.pow(l(),5)*1.4;h.push(.54*I,(P?.51:.77)*I,(P?.86:.92)*I),d.push(S?13+l()*32:1+l()*1.9),u.push(S?1:0)}let f=new s.BufferGeometry;f.setAttribute("position",new s.Float32BufferAttribute(c,3)),f.setAttribute("color",new s.Float32BufferAttribute(h,3)),f.setAttribute("aSize",new s.Float32BufferAttribute(d,1)),f.setAttribute("aDust",new s.Float32BufferAttribute(u,1));let p=new s.ShaderMaterial({transparent:!0,depthWrite:!1,blending:s.AdditiveBlending,uniforms:{uTime:{value:0},uPixelRatio:{value:Math.min(globalThis.devicePixelRatio||1,1.75)}},vertexShader:`
      attribute vec3 color;
      attribute float aSize;
      attribute float aDust;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vDust;
      void main() {
        float shimmer = 0.91 + 0.09 * sin(uTime * 0.55 + position.x * 1.7);
        vColor = color * mix(shimmer, 1.0, aDust);
        vDust = aDust;
        gl_PointSize = aSize * uPixelRatio;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      varying vec3 vColor;
      varying float vDust;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float radius = length(p);
        if (radius > 1.0) discard;
        float alpha = mix(pow(1.0 - radius, 1.5), exp(-radius * radius * 5.5) * pow(1.0 - radius, 1.2) * 0.27, vDust);
        gl_FragColor = vec4(vColor, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `}),_=new s.Points(f,p);_.frustumCulled=!1,t.add(_);let g=new s.IcosahedronGeometry(.35,0),m=new s.MeshStandardMaterial({color:"#344650",roughness:.95,metalness:.1}),y=new s.InstancedMesh(g,m,24),w=new s.Object3D;for(let M=0;M<24;M++){w.position.set((l()-.5)*45,-4+l()*11,-17-l()*13),w.rotation.set(l()*6,l()*6,l()*6);let S=.25+l()*.7;w.scale.set(S*1.5,S*.65,S),w.updateMatrix(),y.setMatrixAt(M,w.matrix)}y.instanceMatrix.needsUpdate=!0,t.add(y);let x=!1;return{group:t,setPlanetVisible(M){r.visible=!!M,o.visible=!!M},update(M,S=!1){if(x)return;let A=Number.isFinite(M)?M:0;p.uniforms.uTime.value=S?0:A,r.rotation.y=.45+(S?0:A*.003)},dispose(){x||(x=!0,y.dispose(),i.dispose(),n.dispose(),a.dispose(),f.dispose(),p.dispose(),g.dispose(),m.dispose(),t.removeFromParent(),t.clear())}}}function XS(s){return()=>(s=s*1664525+1013904223>>>0,s/4294967296)}var Uu=class{constructor(t,e){this.THREE=t,this.group=new t.Group,this.group.name="mine_flame_jets",e.add(this.group),this.capacity=24,this.slots=Array.from({length:this.capacity},()=>({active:!1,age:0,seed:0})),this.activeCount=0,this.disposed=!1,this.serial=0,this.matrix=new t.Matrix4,this.origin=new t.Vector3,this.normal=new t.Vector3,this.up=new t.Vector3(0,1,0),this.rotation=new t.Quaternion,this.scaleVector=new t.Vector3;let i=new t.PlaneGeometry(1,1,4,12);i.translate(0,.5,0),this.fireParameters=new t.InstancedBufferAttribute(new Float32Array(this.capacity*4*4),4).setUsage(t.DynamicDrawUsage),this.fireDirections=new t.InstancedBufferAttribute(new Float32Array(this.capacity*4*3),3),i.setAttribute("jetParameters",this.fireParameters),i.setAttribute("jetDirection",this.fireDirections),this.fireMaterial=new t.ShaderMaterial({transparent:!0,depthWrite:!1,blending:t.AdditiveBlending,side:t.DoubleSide,toneMapped:!1,vertexShader:qS,fragmentShader:YS}),this.fire=new t.InstancedMesh(i,this.fireMaterial,this.capacity*4),this.fire.name="three_flame_tongues_and_ground_flare",this.fire.frustumCulled=!1,this.fire.instanceMatrix.setUsage(t.DynamicDrawUsage),this.group.add(this.fire);let n=new t.PlaneGeometry(1,1);this.smokeParameters=new t.InstancedBufferAttribute(new Float32Array(this.capacity*4*4),4).setUsage(t.DynamicDrawUsage),n.setAttribute("smokeParameters",this.smokeParameters),this.smokeMaterial=new t.ShaderMaterial({transparent:!0,depthWrite:!1,side:t.DoubleSide,toneMapped:!1,vertexShader:ZS,fragmentShader:$S}),this.smoke=new t.InstancedMesh(n,this.smokeMaterial,this.capacity*4),this.smoke.name="short_bounded_smoke_tails",this.smoke.frustumCulled=!1,this.smoke.instanceMatrix.setUsage(t.DynamicDrawUsage),this.group.add(this.smoke),this.clear()}trigger({x:t,y:e=.48,z:i,normal:n=[0,1,0],scale:r=1}){if(this.disposed)return;if(![t,e,i].every(Number.isFinite))throw new TypeError("Flame coordinates must be finite");if(!Array.isArray(n)||n.length!==3||!n.every(Number.isFinite))throw new TypeError("Flame normal must contain three finite coordinates");if(!Number.isFinite(r)||r<=0)throw new RangeError("Flame scale must be positive and finite");if(this.normal.fromArray(n),this.normal.lengthSq()<1e-12)throw new RangeError("Flame normal must be nonzero");this.normal.normalize(),this.rotation.setFromUnitVectors(this.up,this.normal),this.scaleVector.setScalar(r);let a=this.slots.findIndex(c=>!c.active);a<0&&(a=this.slots.reduce((c,h,d)=>h.age>this.slots[c].age?d:c,0));let o=this.slots[a];o.active||this.activeCount++,o.active=!0,o.age=0,o.seed=++this.serial*1.6180339%17;let l=o.seed*2.39996;for(let c=0;c<4;c++){let h=a*4+c,d=c===0,u=c===3,f=l+(c===1?0:Math.PI+.55),p=d?1.9+Math.sin(o.seed)*.18:1.2+c*.09,_=d?.64:.43;this.fireParameters.setXYZW(h,0,u?-1:p,u?.92:_,o.seed+c*3.7),this.fireDirections.setXYZ(h,d||u?0:Math.cos(f)*.54,0,d||u?0:Math.sin(f)*.54),this.origin.set(t,e,i).addScaledVector(this.normal,u?-.1*r:0),this.matrix.compose(this.origin,this.rotation,this.scaleVector),this.fire.setMatrixAt(h,this.matrix),this.origin.set(t,e,i).addScaledVector(this.normal,.1*r),this.matrix.compose(this.origin,this.rotation,this.scaleVector),this.smoke.setMatrixAt(h,this.matrix),this.smokeParameters.setXYZW(h,0,c*.07+.08,o.seed+c*5.3,.56+c*.045)}this.fireDirections.needsUpdate=!0,this.fireParameters.needsUpdate=!0,this.smokeParameters.needsUpdate=!0,this.fire.instanceMatrix.needsUpdate=!0,this.smoke.instanceMatrix.needsUpdate=!0,this.group.visible=!0}update(t){if(this.disposed||!this.activeCount)return;let e=Number.isFinite(t)?Math.max(0,t):0;for(let i=0;i<this.capacity;i++){let n=this.slots[i];if(n.active){n.age+=e,n.age>=.98&&(n.active=!1,this.activeCount--);for(let r=0;r<4;r++){let a=i*4+r;this.fireParameters.setX(a,n.active?n.age:-1),this.smokeParameters.setX(a,n.active?n.age:-1)}}}this.fireParameters.needsUpdate=!0,this.smokeParameters.needsUpdate=!0,this.group.visible=this.activeCount>0}clear(){if(!this.disposed){for(let t=0;t<this.capacity;t++){this.slots[t].active=!1;for(let e=0;e<4;e++)this.fireParameters.setX(t*4+e,-1),this.smokeParameters.setX(t*4+e,-1)}this.activeCount=0,this.fireParameters.needsUpdate=!0,this.smokeParameters.needsUpdate=!0,this.group.visible=!1}}dispose(){if(!this.disposed){this.clear(),this.disposed=!0;for(let t of[this.fire,this.smoke])t.dispose(),t.geometry.dispose(),t.material.dispose();this.group.removeFromParent(),this.group.clear()}}},x0=`
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float turbulence(vec2 p) { return noise(p) * 0.59 + noise(p * 2.07 + 7.3) * 0.28 + noise(p * 4.13) * 0.13; }
`,qS=`
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
`,YS=`
  varying vec2 vUv;
  varying float vAge;
  varying float vSeed;
  varying float vGround;
  ${x0}
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
`,ZS=`
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
`,$S=`
  varying vec2 vUv;
  varying float vProgress;
  varying float vSeed;
  ${x0}
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
`;var Fu=class{constructor(t,e,{reducedMotion:i=()=>!1}={}){this.THREE=t,this.reducedMotion=i,this.disposed=!1,this.nextParticle=0,this.root=new t.Group,this.root.name="survey-effects",e.add(this.root),this.flames=new Uu(t,this.root),this.colors={reveal:new t.Color("#8aefff").multiplyScalar(1.5),chord:new t.Color("#71e8ff").multiplyScalar(1.65),flag:new t.Color("#ffbf69").multiplyScalar(1.75),lose:new t.Color("#ff632d").multiplyScalar(1.95),win:new t.Color("#69ffc1").multiplyScalar(1.8)},this.particles=Array.from({length:384},()=>({life:0,age:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,gravity:0,red:0,green:0,blue:0,size:0,trail:!1})),this.positions=new Float32Array(this.particles.length*3),this.particleColors=new Float32Array(this.particles.length*3),this.opacities=new Float32Array(this.particles.length),this.sizes=new Float32Array(this.particles.length);let n=new t.BufferGeometry;n.setAttribute("position",new t.BufferAttribute(this.positions,3).setUsage(t.DynamicDrawUsage)),n.setAttribute("color",new t.BufferAttribute(this.particleColors,3).setUsage(t.DynamicDrawUsage)),n.setAttribute("particleOpacity",new t.BufferAttribute(this.opacities,1).setUsage(t.DynamicDrawUsage)),n.setAttribute("particleSize",new t.BufferAttribute(this.sizes,1).setUsage(t.DynamicDrawUsage)),n.setDrawRange(0,0);let r=new t.ShaderMaterial({transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:t.AdditiveBlending,vertexShader:JS,fragmentShader:KS});this.points=new t.Points(n,r),this.points.frustumCulled=!1,this.points.visible=!1,this.root.add(this.points),this.trailPositions=new Float32Array(this.particles.length*6),this.trailColors=new Float32Array(this.particles.length*8);let a=new t.BufferGeometry;a.setAttribute("position",new t.BufferAttribute(this.trailPositions,3).setUsage(t.DynamicDrawUsage)),a.setAttribute("color",new t.BufferAttribute(this.trailColors,4).setUsage(t.DynamicDrawUsage)),a.setDrawRange(0,0),this.trails=new t.LineSegments(a,new t.LineBasicMaterial({vertexColors:!0,transparent:!0,depthWrite:!1,toneMapped:!1,blending:t.AdditiveBlending})),this.trails.frustumCulled=!1,this.trails.visible=!1,this.root.add(this.trails),this.ringGeometry=new t.RingGeometry(.965,1,72),this.columnGeometry=new t.CylinderGeometry(.045,.09,1,12,1,!0),this.shellGeometry=new t.SphereGeometry(1,32,20),this.rings=Array.from({length:6},()=>this.createMeshSlot("ring",this.ringGeometry)),this.columns=Array.from({length:2},()=>this.createMeshSlot("column",this.columnGeometry)),this.shells=Array.from({length:6},()=>this.createMeshSlot("shell",this.shellGeometry)),this.fireballs=Array.from({length:6},()=>this.createMeshSlot("fireball",this.shellGeometry)),this.meshSlots=[...this.rings,...this.columns,...this.shells,...this.fireballs]}trigger(t,e){if(this.disposed||this.reducedMotion()||!this.colors[t]||!Number.isFinite(e?.x)||!Number.isFinite(e?.z))return;let i={x:e.x,y:Number.isFinite(e.y)?e.y:.38,z:e.z},n=this.colors[t];t==="lose"?(this.flames.trigger(i),this.startMesh(this.fireballs,i,n,{life:.18,radius:.22,opacity:.65}),this.startMesh(this.shells,i,n,{life:.36,radius:1.1,opacity:.3}),this.startMesh(this.rings,i,n,{life:.55,radius:1.6,opacity:.5}),this.emitParticles(i,n,40,"debris")):t==="win"?(this.startMesh(this.rings,i,n,{life:1.45,radius:4.3,opacity:.68}),this.startMesh(this.shells,i,n,{life:1.2,radius:2.1,opacity:.22}),this.emitParticles(i,n,44,"celebrate")):t==="flag"?(this.startMesh(this.columns,i,n,{life:.65,radius:1.65,opacity:.6}),this.startMesh(this.rings,i,n,{life:.62,radius:.8,opacity:.58}),this.emitParticles(i,n,12,"beacon")):(this.startMesh(this.rings,i,n,{life:.72,radius:t==="chord"?1.8:1.25,opacity:.62}),this.emitParticles(i,n,10,"scan")),this.writeParticles()}update(t,e){if(this.disposed)return;if(this.reducedMotion()){(this.points.visible||this.flames.activeCount||this.meshSlots.some(a=>a.active))&&this.clear();return}let i=Number.isFinite(t)?Math.max(t,0):0,n=Math.min(i,.1);this.flames.update(i);let r=Math.exp(-n*.65);for(let a of this.particles)if(!(a.life<=0)){if(a.age+=i,a.age>=a.life){a.life=0;continue}a.vx*=r,a.vz*=r,a.vy-=a.gravity*n,a.x+=a.vx*n,a.y+=a.vy*n,a.z+=a.vz*n}for(let a of this.meshSlots)if(a.active){if(a.age+=i,a.age>=a.life){a.active=!1,a.mesh.visible=!1;continue}this.updateMesh(a)}this.points.visible&&this.writeParticles()}clear(){if(!this.disposed){for(let t of this.particles)t.life=0;for(let t of this.meshSlots)t.active=!1,t.mesh.visible=!1;this.points.geometry.setDrawRange(0,0),this.points.visible=!1,this.nextParticle=0,this.flames.clear(),this.trails.geometry.setDrawRange(0,0),this.trails.visible=!1}}dispose(){if(!this.disposed){this.clear(),this.disposed=!0,this.root.removeFromParent(),this.points.geometry.dispose(),this.points.material.dispose(),this.flames.dispose(),this.trails.geometry.dispose(),this.trails.material.dispose(),this.ringGeometry.dispose(),this.columnGeometry.dispose(),this.shellGeometry.dispose();for(let t of this.meshSlots)t.mesh.material.dispose();this.root.clear()}}createMeshSlot(t,e){let i=this.THREE,n=t==="shell"||t==="fireball"?new i.ShaderMaterial({uniforms:{effectColor:{value:new i.Color},effectOpacity:{value:0},effectAge:{value:0}},vertexShader:t==="fireball"?tw:jS,fragmentShader:t==="fireball"?ew:QS,transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:t==="fireball"?i.NormalBlending:i.AdditiveBlending,side:i.FrontSide}):new i.MeshBasicMaterial({color:16777215,transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:i.AdditiveBlending,side:i.DoubleSide}),r=new i.Mesh(e,n);return r.visible=!1,t==="ring"&&(r.rotation.x=-Math.PI/2),this.root.add(r),{kind:t,mesh:r,active:!1,age:0,life:0,radius:0,opacity:0,baseY:0}}startMesh(t,e,i,n){let r=t.find(a=>!a.active)||t.reduce((a,o)=>o.age>a.age?o:a);Object.assign(r,n,{active:!0,age:0,baseY:e.y}),r.mesh.position.set(e.x,e.y,e.z),r.mesh.visible=!0,r.kind==="shell"||r.kind==="fireball"?r.mesh.material.uniforms.effectColor.value.copy(i):r.mesh.material.color.copy(i),this.updateMesh(r)}updateMesh(t){let e=t.age/t.life,i=1-(1-e)**2.5,n=t.opacity*(1-e)**1.35;if(t.kind==="column"){let r=.2+t.radius*Math.sin(Math.PI*e);t.mesh.scale.set(1-e*.55,r,1-e*.55),t.mesh.position.y=t.baseY+r/2,t.mesh.material.opacity=n}else if(t.kind==="fireball"){let r=.13+t.radius*(1-Math.exp(-e*9));t.mesh.scale.set(r,r*(1+e*.65),r),t.mesh.position.y=t.baseY+e*.75,t.mesh.material.uniforms.effectAge.value=e,t.mesh.material.uniforms.effectOpacity.value=t.opacity*(1-e**1.7)}else t.mesh.scale.setScalar(.12+t.radius*i),t.kind==="shell"?t.mesh.material.uniforms.effectOpacity.value=n:t.mesh.material.opacity=n}emitParticles(t,e,i,n){for(let r=0;r<i;r+=1){let a=this.particles[this.nextParticle];this.nextParticle=(this.nextParticle+1)%this.particles.length;let o=Math.random()*Math.PI*2,l=n==="debris"?.8+Math.random()*2.2:n==="celebrate"?.7+Math.random()*1.1:.12+Math.random()*.5,c=n==="beacon"?.1:Math.random()*.22;a.life=n==="debris"?.55+Math.random()*.35:n==="celebrate"?1.15+Math.random()*.45:.55+Math.random()*.35,a.age=0,a.x=t.x+Math.cos(o)*c,a.y=t.y+.04,a.z=t.z+Math.sin(o)*c,a.vx=Math.cos(o)*l,a.vz=Math.sin(o)*l,a.vy=n==="debris"?2.4+Math.random()*5.2:n==="celebrate"?2+Math.random()*2.1:.7+Math.random()*1.4,a.gravity=n==="debris"?8:n==="celebrate"?1.7:.45,a.trail=n==="debris",a.red=e.r,a.green=e.g,a.blue=e.b,a.size=n==="debris"?1.5+Math.random()*2:2+Math.random()*2.8}this.points.visible=!0}writeParticles(){let t=0,e=0;for(let i of this.particles){if(i.life<=0)continue;let n=t*3;if(this.positions[n]=i.x,this.positions[n+1]=i.y,this.positions[n+2]=i.z,this.particleColors[n]=i.red,this.particleColors[n+1]=i.green,this.particleColors[n+2]=i.blue,this.opacities[t]=Math.pow(1-i.age/i.life,1.45),this.sizes[t]=i.size,i.trail){let r=e*6,a=e*8,o=.035+i.age*.04;this.trailPositions.set([i.x,i.y,i.z,i.x-i.vx*o,i.y-i.vy*o,i.z-i.vz*o],r);let l=this.opacities[t];this.trailColors.set([i.red*1.15,i.green*1.6,i.blue,l*.9,i.red*.65,i.green*.25,0,0],a),e++}t+=1}if(this.points.geometry.setDrawRange(0,t),this.points.visible=t>0,this.trails.visible=e>0,this.trails.geometry.setDrawRange(0,e*2),e)for(let i of Object.values(this.trails.geometry.attributes))i.needsUpdate=!0;if(t)for(let i of Object.values(this.points.geometry.attributes))i.needsUpdate=!0}},JS=`
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
`,KS=`
  varying vec3 effectColor;
  varying float effectOpacity;
  void main() {
    vec2 p = abs(gl_PointCoord - vec2(0.5)) * 2.0;
    float shape = 1.0 - smoothstep(0.4, 1.0, p.x + p.y);
    float alpha = shape * effectOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(effectColor, alpha);
  }
`,jS=`
  varying vec3 effectNormal;
  varying vec3 effectView;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    effectNormal = normalize(normalMatrix * normal);
    effectView = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`,QS=`
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
`,tw=`
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
`,ew=`
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
`;var Ba=class{constructor(t,e){if(!Number.isInteger(e)||e<1)throw new RangeError("Mine capacity must be a positive integer");this.THREE=t,this.capacity=e,this.group=new t.Group,this.group.name="mechanical_mines",this.dummy=new t.Object3D,this.direction=new t.Vector3,this.up=new t.Vector3(0,1,0),this.color=new t.Color,this.itemTransform=new t.Matrix4,this.itemTranslation=new t.Matrix4,this.outputMatrix=new t.Matrix4,this.itemOrigin=new t.Vector3,this.itemNormal=new t.Vector3,this.itemScale=new t.Vector3,this.itemRotation=new t.Quaternion,this.disposed=!1;let i=new t.MeshStandardMaterial({color:"#39434a",metalness:.82,roughness:.36,side:t.DoubleSide}),n=new t.MeshStandardMaterial({color:"#6e777b",metalness:.9,roughness:.3}),r=new t.MeshStandardMaterial({color:"#c0a58b",metalness:.88,roughness:.29}),a=new t.MeshBasicMaterial({color:16777215}),o=new t.MeshStandardMaterial({color:"#14191c",metalness:.35,roughness:.93});this.parts={armorPetals:this.createInstances("mine_armor_petals",new t.SphereGeometry(.255,12,12,.085,Math.PI/2-.17,.24,Math.PI-.48),i,e*4),reactorCores:this.createInstances("mine_reactor_cores_and_fuse_lights",new t.SphereGeometry(.19,14,10),a,e*2),equatorSeams:this.createInstances("mine_equator_and_residual_heat",new t.TorusGeometry(.257,.012,5,32),a,e),sensorCollars:this.createInstances("mine_sensor_collars",new t.CylinderGeometry(.039,.052,.064,8),n,e*6),sensorTips:this.createInstances("mine_short_contact_sensors",new t.ConeGeometry(.04,.095,8),r,e*6),fuseHousings:this.createInstances("mine_top_fuse_housings",new t.CylinderGeometry(.071,.092,.1,10),n,e),spentBases:this.createInstances("mine_spent_bases",new t.CylinderGeometry(.265,.3,.065,10),o,e),spentFragments:this.createInstances("mine_broken_armor_fragments",new t.IcosahedronGeometry(.115,0),o,e*4)}}update(t){if(this.disposed)return;if(!Array.isArray(t))throw new TypeError("Mine items must be an array");if(t.length>this.capacity)throw new RangeError("Mine items exceed capacity");let e=Object.fromEntries(Object.keys(this.parts).map(i=>[i,0]));for(let i of t){let{x:n,z:r,y:a=.35,stage:o="armed"}=i;if(![n,a,r].every(Number.isFinite))throw new TypeError("Mine coordinates must be finite");if(!["armed","primed","spent"].includes(o))throw new RangeError("Unknown mine stage");let l=i.normal??[0,1,0],c=i.scale??1;if(!Array.isArray(l)||l.length!==3||!l.every(Number.isFinite))throw new TypeError("Mine normal must contain three finite coordinates");if(!Number.isFinite(c)||c<=0)throw new RangeError("Mine scale must be positive and finite");if(this.itemNormal.fromArray(l),this.itemNormal.lengthSq()<1e-12)throw new RangeError("Mine normal must be nonzero");this.itemRotation.setFromUnitVectors(this.up,this.itemNormal.normalize()),this.itemOrigin.set(n,a,r),this.itemScale.setScalar(c),this.itemTransform.compose(this.itemOrigin,this.itemRotation,this.itemScale),this.itemTransform.multiply(this.itemTranslation.makeTranslation(-n,-a,-r));let h=Number.isFinite(i.progress)?Math.max(0,Math.min(1,i.progress)):0,d=o==="primed",u=d?.5+Math.sin(h*Math.PI*5)*.5:0,f=d?1+h*.05+u*.012:1;if(o==="spent"){let _=a-.225;this.place(this.parts.spentBases,e.spentBases++,n,_,r),this.dummy.rotation.set(-Math.PI/2,0,0),this.place(this.parts.equatorSeams,e.equatorSeams,n,_+.038,r,.84,.84,.42,!0),this.parts.equatorSeams.setColorAt(e.equatorSeams++,this.color.setRGB(.38*(1-h*.7),.018,.004));for(let g=0;g<4;g++){let m=g*Math.PI/2+.31,y=.14+g%2*.045;this.dummy.rotation.set(.12*g,m,.19*(g-1.5)),this.place(this.parts.spentFragments,e.spentFragments++,n+Math.cos(m)*y,_+.043,r+Math.sin(m)*y,1.05,.34,.78,!0)}continue}for(let _=0;_<4;_++)this.dummy.rotation.set(0,_*Math.PI/2,0),this.place(this.parts.armorPetals,e.armorPetals++,n,a,r,f,f,f,!0);let p=d?2.4+h*1.9+u*.8:1.4;this.color.setRGB(p,p*(d?.035:.085),.012),this.place(this.parts.reactorCores,e.reactorCores,n,a,r,f,f,f),this.parts.reactorCores.setColorAt(e.reactorCores++,this.color),this.place(this.parts.fuseHousings,e.fuseHousings++,n,a+.257*f,r),this.place(this.parts.reactorCores,e.reactorCores,n,a+.312*f,r,.28,.055,.28),this.parts.reactorCores.setColorAt(e.reactorCores++,this.color),this.dummy.rotation.set(-Math.PI/2,0,0),this.place(this.parts.equatorSeams,e.equatorSeams,n,a,r,f,f,f,!0),this.parts.equatorSeams.setColorAt(e.equatorSeams++,this.color.setRGB(p*.8,p*(d?.03:.075),.005));for(let _=0;_<6;_++){let g=_*Math.PI/3+Math.PI/6;this.direction.set(Math.cos(g),.07,Math.sin(g)).normalize(),this.dummy.quaternion.setFromUnitVectors(this.up,this.direction);let m=.249*f;this.place(this.parts.sensorCollars,e.sensorCollars++,n+this.direction.x*m,a+this.direction.y*m,r+this.direction.z*m,1,1,1,!0),this.dummy.quaternion.setFromUnitVectors(this.up,this.direction);let y=.3*f;this.place(this.parts.sensorTips,e.sensorTips++,n+this.direction.x*y,a+this.direction.y*y,r+this.direction.z*y,1,1,1,!0)}}for(let[i,n]of Object.entries(this.parts))n.count=e[i],n.instanceMatrix.needsUpdate=!0,n.instanceColor&&(n.instanceColor.needsUpdate=!0),n.computeBoundingSphere()}dispose(){if(this.disposed)return;this.disposed=!0;let t=new Set;for(let e of Object.values(this.parts))e.dispose(),e.geometry.dispose(),t.add(e.material);for(let e of t)e.dispose();this.group.removeFromParent(),this.group.clear()}createInstances(t,e,i,n){let r=new this.THREE.InstancedMesh(e,i,n);return r.name=t,r.count=0,r.instanceMatrix.setUsage(this.THREE.DynamicDrawUsage),this.group.add(r),r}place(t,e,i,n,r,a=1,o=1,l=1,c=!1){this.dummy.position.set(i,n,r),c||this.dummy.rotation.set(0,0,0),this.dummy.scale.set(a,o,l),this.dummy.updateMatrix(),this.outputMatrix.multiplyMatrices(this.itemTransform,this.dummy.matrix),t.setMatrixAt(e,this.outputMatrix)}};var Ou=class{constructor(){this.reset()}reset(){this.time=0,this.entries=[],this.byId=new Map,this.active=!1,this.completed=!1,this.duration=0}start(t){if(this.reset(),t.status!=="lost")return;let e=t.cells.filter(l=>l.revealed&&l.mine),i=e.find(l=>l.exploded)||e[0];if(!i)return;e.sort((l,c)=>l.id===i.id?-1:c.id===i.id?1:Math.hypot(l.x-i.x,l.y-i.y)-Math.hypot(c.x-i.x,c.y-i.y)||l.id-c.id);let n=Math.min(3,e.length),r=e.length-n,a=.12+(n-1)*.28,o=Math.min(2.03,r*.14);this.entries=e.map((l,c)=>{let h=r>0?(c-n+1)/r:0,d=c<n?.12+c*.28:a+.12+o*(1-(1-h)**1.9);return{id:l.id,x:l.x,y:l.y,index:c,blastAt:d,revealAt:Math.max(0,d-.42),fired:!1,revealed:c===0}}),this.byId=new Map(this.entries.map(l=>[l.id,l])),this.duration=this.entries.at(-1).blastAt+1.1,this.active=!0}advance(t){if(!this.active)return{revealed:[],explosions:[],finished:!1};this.time+=Math.max(0,Number.isFinite(t)?t:0);let e=[],i=[];for(let r of this.entries)!r.revealed&&this.time>=r.revealAt&&(r.revealed=!0,e.push(r.id)),!r.fired&&this.time>=r.blastAt&&(r.fired=!0,i.push({...r,total:this.entries.length}));let n=this.time>=this.duration;return n&&(this.active=!1,this.completed=!0),{revealed:e,explosions:i,finished:n}}stage(t){let e=this.byId.get(t);if(!e)return{stage:"armed",progress:0};if(this.time<e.revealAt)return{stage:"hidden",progress:0};if(this.time>=e.blastAt)return{stage:"spent",progress:Math.min(1,(this.time-e.blastAt)/.7)};let i=1-Math.min(1,(e.blastAt-this.time)/.42);return{stage:i<.35?"armed":"primed",progress:i}}present(t){return!this.entries.length||t.status!=="lost"?t:{...t,cells:t.cells.map(e=>this.byId.has(e.id)&&this.stage(e.id).stage==="hidden"?{...e,revealed:!1,mine:null,adjacent:null,exploded:!1}:e)}}};var Bu=class{constructor(t,e,{reducedMotion:i=()=>!1,onLaunch:n=()=>{},onBurst:r=()=>{}}={}){this.reducedMotion=i,this.onLaunch=n,this.onBurst=r,this.active=!1,this.activeCount=0,this.launchCount=0,this.burstCount=0,this.disposed=!1,this.elapsed=0,this.nextLaunch=0,this.nextParticle=0,this.duration=5.4,this.root=new t.Group,this.root.name="victory-fireworks",e.add(this.root),this.palette=[new t.Color("#66eaff").multiplyScalar(1.65),new t.Color("#ffd782").multiplyScalar(1.8),new t.Color("#b692ff").multiplyScalar(1.75)],this.gold=this.palette[1],this.particles=Array.from({length:bn},()=>({life:0,age:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,gravity:0,drag:0,red:0,green:0,blue:0,size:0,kind:0,twinkle:0})),this.rockets=Array.from({length:v0.length},()=>({active:!1,core:null,age:0,trailClock:0,originX:0,originZ:0,targetX:0,targetY:0,targetZ:0,flight:0,radius:0,colorIndex:0,pan:0,finale:!1})),this.positions=new Float32Array(bn*3),this.colors=new Float32Array(bn*3),this.opacities=new Float32Array(bn),this.sizes=new Float32Array(bn);let a=new t.BufferGeometry;for(let[l,c,h]of[["position",this.positions,3],["color",this.colors,3],["particleOpacity",this.opacities,1],["particleSize",this.sizes,1]])a.setAttribute(l,new t.BufferAttribute(c,h).setUsage(t.DynamicDrawUsage));a.setDrawRange(0,0),this.points=new t.Points(a,new t.ShaderMaterial({transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:t.AdditiveBlending,uniforms:{pixelRatio:{value:Math.min(2,globalThis.devicePixelRatio||1)}},vertexShader:sw,fragmentShader:rw})),this.points.name="victory-firework-particles",this.points.frustumCulled=!1,this.points.visible=!1,this.root.add(this.points),this.trailPositions=new Float32Array(bn*6),this.trailColors=new Float32Array(bn*8);let o=new t.BufferGeometry;o.setAttribute("position",new t.BufferAttribute(this.trailPositions,3).setUsage(t.DynamicDrawUsage)),o.setAttribute("color",new t.BufferAttribute(this.trailColors,4).setUsage(t.DynamicDrawUsage)),o.setDrawRange(0,0),this.trails=new t.LineSegments(o,new t.LineBasicMaterial({vertexColors:!0,transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,blending:t.AdditiveBlending})),this.trails.name="victory-firework-streaks",this.trails.frustumCulled=!1,this.trails.visible=!1,this.root.add(this.trails)}start({width:t=9,height:e=9}={}){if(this.disposed||(this.clear(),this.reducedMotion()))return;let i=Number.isFinite(t)?Math.max(5,Math.min(50,t)):9,n=Number.isFinite(e)?Math.max(5,Math.min(30,e)):9,r=(i-1)*1.06/2,a=(n-1)*1.06/2,o=Math.max(.8,Math.min(2.25,Math.min(i,n)/9));for(let l=0;l<this.rockets.length;l+=1){let c=this.rockets[l],[h,d,u]=nw[l];c.originX=h*r*.91,c.originZ=d*a*.83,c.targetX=h*r*.67,c.targetZ=d*a*.6,c.targetY=(2.9+u*.85)*o,c.flight=.68+u*.12,c.radius=(1.4+u*.28)*o,c.colorIndex=l%this.palette.length,c.pan=Math.max(-1,Math.min(1,h*.8)),c.finale=l>=6}this.active=!0,this.launch(this.rockets[this.nextLaunch++]),this.syncBuffers()}update(t){if(this.disposed||!this.active)return;if(this.reducedMotion()){this.clear();return}if(!Number.isFinite(t)||t<=0)return;let e=Math.min(this.duration,this.elapsed+t);for(;this.elapsed<e;)this.advance(Math.min(e-this.elapsed,.08));this.syncBuffers(),(this.elapsed>=this.duration||this.nextLaunch===this.rockets.length&&this.activeCount===0)&&this.finish()}advance(t){this.elapsed+=t;for(let e of this.particles){if(e.life<=0||e.kind===2)continue;if(e.age+=t,e.age>=e.life){e.life=0;continue}let i=Math.exp(-e.drag*t);e.vx*=i,e.vz*=i,e.vy=e.vy*i-e.gravity*t,e.x+=e.vx*t,e.y+=e.vy*t,e.z+=e.vz*t}for(let e of this.rockets){if(!e.active)continue;e.age+=t;let i=Math.min(1,e.age/e.flight),n=e.core,r=Math.sin(i*Math.PI/2);n.x=e.originX+(e.targetX-e.originX)*i,n.y=.48+(e.targetY-.48)*r,n.z=e.originZ+(e.targetZ-e.originZ)*i,n.vx=(e.targetX-e.originX)/e.flight,n.vy=(e.targetY-.48)*Math.PI*Math.cos(i*Math.PI/2)/(2*e.flight),n.vz=(e.targetZ-e.originZ)/e.flight,e.trailClock+=t;let a=Math.min(4,Math.floor(e.trailClock/.022));e.trailClock%=.022;for(let o=0;o<a;o+=1){let l=this.allocate();if(!l)break;this.paint(l,this.gold,2.1+Math.random()*1.3);let c=Math.random()*t;l.x=n.x-n.vx*c,l.y=n.y-n.vy*c,l.z=n.z-n.vz*c,l.vx=(Math.random()-.5)*.22,l.vy=-.35-Math.random()*.45,l.vz=(Math.random()-.5)*.22,l.gravity=1.05,l.drag=.45,l.life=.22+Math.random()*.2}i===1&&this.burst(e)}this.nextLaunch<this.rockets.length&&this.elapsed>=v0[this.nextLaunch]&&this.launch(this.rockets[this.nextLaunch++])}clear(){this.finish(),this.elapsed=0,this.nextLaunch=0,this.nextParticle=0,this.launchCount=0,this.burstCount=0}dispose(){this.disposed||(this.clear(),this.disposed=!0,this.root.removeFromParent(),this.points.geometry.dispose(),this.points.material.dispose(),this.trails.geometry.dispose(),this.trails.material.dispose(),this.root.clear(),this.onLaunch=()=>{},this.onBurst=()=>{})}launch(t){let e=this.allocate();e&&(this.paint(e,this.gold,6.5),e.kind=2,e.life=1,e.x=t.originX,e.y=.48,e.z=t.originZ,e.vy=4,t.core=e,t.active=!0,t.age=0,t.trailClock=0,this.launchCount+=1,this.onLaunch({strength:t.finale?.48:.58,pan:t.pan}))}burst(t){t.active=!1,t.core.life=0,t.core=null;let e=t.finale?88:96,i=this.palette[t.colorIndex],n=Math.random()*Math.PI*2;for(let r=0;r<e;r+=1){let a=this.allocate();if(!a)break;let o=1-2*(r+.5)/e,l=Math.sqrt(1-o*o),c=r*iw+n,h=r%5===0,d=t.radius*(h?1.2:2.05+Math.random()*.3);this.paint(a,r%9===0?this.gold:i,h?2.5:3.1+Math.random()*1.4),a.kind=1,a.x=t.targetX,a.y=t.targetY,a.z=t.targetZ,a.vx=Math.cos(c)*l*d,a.vy=o*d+t.radius*.28,a.vz=Math.sin(c)*l*d,a.gravity=1.05*Math.sqrt(t.radius),a.drag=1.2,a.life=1.08+Math.random()*.46,a.twinkle=r%7===0?1:0}this.burstCount+=1,this.onBurst({strength:t.finale?.7:.86,pan:t.pan})}allocate(){for(let t=0;t<bn;t+=1){let e=(this.nextParticle+t)%bn,i=this.particles[e];if(!(i.life>0))return this.nextParticle=(e+1)%bn,i.age=0,i.vx=0,i.vy=0,i.vz=0,i.gravity=0,i.drag=0,i.kind=0,i.twinkle=0,i}return null}paint(t,e,i){t.red=e.r,t.green=e.g,t.blue=e.b,t.size=i}syncBuffers(){let t=0,e=0;for(let i of this.particles){if(i.life<=0)continue;let n=1-i.age/i.life,r=i.kind===2?1:Math.pow(n,1.15),a=i.twinkle?.82+.18*Math.sin(i.age*26+i.x*3):1,o=r*a,l=t*3;this.positions[l]=i.x,this.positions[l+1]=i.y,this.positions[l+2]=i.z,this.colors[l]=i.red,this.colors[l+1]=i.green,this.colors[l+2]=i.blue,this.opacities[t]=o,this.sizes[t]=i.size*(.7+n*.3),t+=1;let c=i.kind===2?.12:.1+n*.075,h=e*6;this.trailPositions[h]=i.x,this.trailPositions[h+1]=i.y,this.trailPositions[h+2]=i.z,this.trailPositions[h+3]=i.x-i.vx*c,this.trailPositions[h+4]=i.y-i.vy*c,this.trailPositions[h+5]=i.z-i.vz*c;let d=e*8;this.trailColors[d]=i.red,this.trailColors[d+1]=i.green,this.trailColors[d+2]=i.blue,this.trailColors[d+3]=o*.68,this.trailColors[d+4]=i.red,this.trailColors[d+5]=i.green,this.trailColors[d+6]=i.blue,this.trailColors[d+7]=0,e+=1}this.activeCount=t,this.points.visible=t>0,this.trails.visible=e>0,this.points.geometry.setDrawRange(0,t),this.trails.geometry.setDrawRange(0,e*2);for(let i of Object.values(this.points.geometry.attributes))i.needsUpdate=!0;for(let i of Object.values(this.trails.geometry.attributes))i.needsUpdate=!0}finish(){this.active=!1,this.activeCount=0;for(let t of this.particles)t.life=0;for(let t of this.rockets)t.active=!1,t.core=null;this.points.visible=!1,this.trails.visible=!1,this.points.geometry.setDrawRange(0,0),this.trails.geometry.setDrawRange(0,0)}},bn=960,iw=Math.PI*(3-Math.sqrt(5)),v0=[0,.4,.84,1.29,1.75,2.19,2.84,2.94,3.04],nw=[[-1,.4,.5],[1,-.28,.85],[-.64,-1,.25],[.75,1,.65],[-1,-.22,1],[1,.65,.35],[-.74,.8,.6],[.04,-.85,.95],[.76,.42,.5]],sw=`
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
`,rw=`
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
`;var cc={closed:new at("#344352"),open:new at("#11363e"),hover:new at("#8ab7c2"),flagged:new at("#666050"),danger:new at("#82453a")},za=class{constructor(t,{onReveal:e,onFlag:i,onChord:n,onHover:r,onFailure:a,onExplosion:o,onFirework:l,onFireworksStop:c,onChainComplete:h}){this.container=t,this.callbacks={onReveal:e,onFlag:i,onChord:n,onHover:r,onFailure:a,onExplosion:o,onFirework:l,onFireworksStop:c,onChainComplete:h},this.detonation=new Ou,this.reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)"),this.renderer=new ac({antialias:!0,alpha:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75)),this.renderer.setClearColor(0,0),this.renderer.outputColorSpace=Be,this.renderer.toneMapping=hs,this.renderer.toneMappingExposure=1.35,this.renderer.domElement.setAttribute("aria-hidden","true"),t.appendChild(this.renderer.domElement),this.scene=new Fs,this.scene.background=new at("#030810"),this.camera=new Gi(-9,9,9,-9,.1,240),this.camera.position.set(13,18,19),this.composer=new Lu(this.renderer),this.composer.addPass(new Du(this.scene,this.camera)),this.bloom=new Oa(new q(800,600),.75,.65,.85),this.composer.addPass(this.bloom),this.composer.addPass(new Nu),this.controls=new Ru(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.1,this.controls.enablePan=!0,this.controls.minPolarAngle=.05,this.controls.maxPolarAngle=Math.PI*.36,this.controls.minZoom=.65,this.controls.maxZoom=5,this.controls.mouseButtons={LEFT:Hi.ROTATE,MIDDLE:Hi.PAN,RIGHT:null},this.controls.touches={ONE:Mi.ROTATE,TWO:Mi.DOLLY_PAN},this.controls.rotateSpeed=.55,this.controls.zoomSpeed=.8,this.pointer=new q,this.raycaster=new ua,this.dummy=new re,this.hoverId=-1,this.focusId=-1,this.mode="reveal",this.topView=!1,this.pointerState=null,this.pointers=new Set,this.board=new Ti,this.scene.add(this.board),this.labelMeshes=[],this.motions=[],this.textures=[],this.lastTime=0,this.setupLighting(),this.setupEnvironment(),this.cosmos=_0(ds),this.scene.add(this.cosmos.group),this.effects=new Fu(ds,this.scene,{reducedMotion:()=>this.reducedMotion.matches}),this.fireworks=new Bu(ds,this.scene,{reducedMotion:()=>this.reducedMotion.matches,onLaunch:d=>this.callbacks.onFirework?.("launch",d),onBurst:d=>this.callbacks.onFirework?.("burst",d)}),this.bindEvents(),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(t),this.onVisibility=()=>{cancelAnimationFrame(this.frame),this.frame=null,document.hidden||(this.lastTime=performance.now(),this.frame=requestAnimationFrame(d=>this.animate(d)))},document.addEventListener("visibilitychange",this.onVisibility),this.frame=requestAnimationFrame(d=>this.animate(d))}rebuild(t){this.detonation.reset(),this.fireworks.clear(),this.callbacks.onFireworksStop?.(),this.mines?.dispose(),this.effects.clear(),this.disposeGroup(this.board),this.textures.forEach(a=>a.dispose()),this.textures=[],this.board.clear(),this.snapshot=t,this.width=t.width,this.height=t.height,this.count=this.width*this.height,this.hoverId=-1,this.focusId=-1,this.motions=new Float32Array(this.count).fill(1);let e=y0(.93,.27,.055),i=new Ge({color:16777215,metalness:.55,roughness:.28});this.tiles=new De(e,i,this.count),this.tiles.instanceMatrix.setUsage(us),this.board.add(this.tiles);let n=y0(1.005,.13,.025);this.tileBases=new De(n,new Ge({color:"#111f2b",metalness:.75,roughness:.48}),this.count),this.board.add(this.tileBases);let r=cw();this.textures.push(r),this.slits=new De(new Ci(.79,.79),new ce({map:r,color:"#8ac4c8",transparent:!0,opacity:.6,depthWrite:!1}),this.count),this.board.add(this.slits),this.innerLights=new De(new rs(.11,.135,24),new ce({color:"#56858c",side:fi}),this.count),this.board.add(this.innerLights),this.colliders=new De(new Ke(1.01,.45,1.01),new ce({visible:!1}),this.count),this.board.add(this.colliders);for(let a=0;a<this.count;a++){let o=this.position(a);this.setInstance(this.tileBases,a,o.x,-.1,o.z),this.setInstance(this.colliders,a,o.x,.18,o.z)}this.tileBases.instanceMatrix.needsUpdate=!0,this.colliders.instanceMatrix.needsUpdate=!0,this.labelMeshes=Array.from({length:8},(a,o)=>{let l=ow(o+1);this.textures.push(l);let c=new De(new Ci(.51,.57),new ce({map:l,transparent:!0,depthWrite:!1,alphaTest:.1}),this.count);return c.count=0,c.renderOrder=4,this.board.add(c),c}),this.flagPoles=new De(new Bi(.016,.024,.72,6),new Ge({color:"#dfbd7f",metalness:.7,roughness:.3}),this.count),this.flagCrystals=new De(new ki(.17),new Ge({color:"#f9bc68",emissive:"#b77724",emissiveIntensity:.9,metalness:.45,roughness:.25}),this.count),this.flagRings=new De(new en(.21,.012,5,24),new ce({color:"#e6b86f"}),this.count),this.mines=new Ba(ds,t.mines),this.board.add(this.mines.group),this.wrongMarks=new De(new Ke(.55,.025,.06),new ce({color:"#f1a19a"}),this.count*2),this.board.add(this.flagPoles,this.flagCrystals,this.flagRings,this.wrongMarks),this.createFoundation(),this.createCursor(),this.createPulse(),this.update(t,{changed:[],action:"noop"}),this.resetCamera()}update(t,e={changed:[],action:"noop"}){let i=this.snapshot?.status;if(this.snapshot=t,!!this.tiles){e.action==="lose"&&this.detonation.start(t),this.presentation=this.detonation.present(t);for(let n of e.changed)this.motions[n]=this.reducedMotion.matches?1:0;if(this.drawTiles(),this.drawSymbols(),e.action!=="noop"&&e.action!=="lose"&&e.changed.length){let n=this.position(e.changed[0]);this.effects.trigger(e.action,{...n,y:.35}),this.pulse.position.set(n.x,.34,n.z),this.pulse.material.color.set(t.status==="lost"?"#ff855b":"#97ddd5"),this.pulseAge=this.reducedMotion.matches?99:0}t.status==="won"&&(this.trimMaterial.color.set("#adf2c9"),i!=="won"&&this.fireworks.start({width:this.width,height:this.height})),t.status==="lost"&&this.trimMaterial.color.set("#cd7959")}}setMode(t){this.mode=t}focus(t){this.hoverId=-1,this.focusId=t,this.drawTiles()}clearFocus(){this.focusId=-1,this.drawTiles()}setTopView(t){this.topView=t,this.controls.enableRotate=!t,this.resetCamera(!1)}resetCamera(t=!0){this.controls.target.set(0,-.1,0),this.topView?this.camera.position.set(0,30,.01):this.camera.position.set(13,20,21),this.camera.lookAt(this.controls.target),t&&(this.camera.zoom=1),this.resize(),this.controls.update(),this.refreshCursor()}projectCell(t){let e=this.position(t),i=new C(e.x,.3,e.z).project(this.camera),n=this.renderer.domElement.getBoundingClientRect();return{x:n.left+(i.x+1)*n.width/2,y:n.top+(1-i.y)*n.height/2}}resize(){let t=this.container.clientWidth,e=this.container.clientHeight;if(!t||!e)return;this.renderer.setSize(t,e),this.composer.setSize(t,e);let i=t/e,n=(this.width||9)*1.06,r=(this.height||9)*1.06,a=this.topView?n+3:n*.87+r*.5+3.1,o=this.topView?r+3.2:r*.64+n*.38+5.7,l=Math.max(o,a/i)/2;this.camera.left=-l*i,this.camera.right=l*i,this.camera.top=l,this.camera.bottom=-l,this.camera.updateProjectionMatrix()}setupLighting(){this.scene.add(new Ys("#c4e2eb","#121622",2));let t=new _n("#e3edf1",3.8);t.position.set(-5,13,9),this.scene.add(t);let e=new _n("#5997b9",2.6);e.position.set(7,4,-9),this.scene.add(e);let i=new _n("#bc9270",.6);i.position.set(-7,1,-3),this.scene.add(i);let n=new _n("#537a8d",1.6);n.position.set(4,-3,8),this.scene.add(n)}setupEnvironment(){let t=[],e=M0(71);for(let n=0;n<280;n++)t.push((e()-.5)*140,(e()-.5)*100,(e()-.5)*130);let i=new kt;i.setAttribute("position",new vt(t,3)),this.stars=new zs(i,new is({color:"#a7bbc7",size:.055,transparent:!0,opacity:.48,sizeAttenuation:!0})),this.scene.add(this.stars)}createFoundation(){let t=this.width*1.06,e=this.height*1.06,i=Math.max(t,e),n=M0(324),r=new Ge({color:"#283442",metalness:.48,roughness:.72,flatShading:!0}),a=new Ge({color:"#1e2633",metalness:.3,roughness:.78,flatShading:!0}),o=new Ge({color:"#607d8b",metalness:.7,roughness:.34});this.trimMaterial=new ce({color:new at("#51b7c6").multiplyScalar(1.6)});let l=new ce({color:new at("#63e9f0").multiplyScalar(2.2)}),c=new Bi(.67,.22,1,4,1);c.rotateY(Math.PI/4);let h=new De(c,r,this.count),d=new De(new Ke(.018,1,.025),l,this.count);for(let M=0;M<this.count;M++){let S=this.position(M),v=.7+(1-Math.hypot(S.x/t,S.z/e))*1+n()*.95;this.setInstance(h,M,S.x,-v/2-.14,S.z,1,v,1),h.setColorAt(M,new at().setHSL(.58,.17+n()*.13,.5+n()*.22)),this.setInstance(d,M,S.x+.33,-v*.35,S.z+.33,1,v*.57,1)}h.instanceMatrix.needsUpdate=!0,d.instanceMatrix.needsUpdate=!0,this.board.add(h,d);let u=new ee(new ss(1,0),a);u.scale.set(t*.43,1.6,e*.43),u.position.set(0,-1.75,0),u.rotation.y=.13,this.board.add(u),this.core=new ee(new ki(.75,0),new Ge({color:"#41616b",emissive:"#2e9fb2",emissiveIntensity:1.05,metalness:.42,roughness:.48})),this.core.position.set(t*.08,-3.5,e*.32),this.core.scale.y=1.65,this.core.rotation.y=.4,this.board.add(this.core);let f=new Js("#387d8d",7,i*1.4,2);f.position.copy(this.core.position),this.board.add(f);let p=new ce({color:"#499ba5"});for(let M=0;M<3;M++){let S=new ee(new en(1+M*.16,M===0?.025:.014,6,72,Math.PI*1.72),M===0?p:o);S.position.copy(this.core.position),S.rotation.set(.6+M*.8,M*1.3,M*.5),this.board.add(S)}let _=lw();this.textures.push(_);let g=new Bs(new es({map:_,color:"#399fb1",transparent:!0,opacity:.14,blending:Fn,depthWrite:!1}));g.position.copy(this.core.position),g.scale.set(3.2,3.2,1),this.board.add(g),this.orbitalRings=new Ti,this.orbitalRings.position.y=-1.15;let m=Math.hypot(t,e)*.57;for(let M=0;M<3;M++){let S=new ee(new en(m+M*.33,M===0?.028:.013,5,150,Math.PI*(M===0?1.85:1.5)),M===0?this.trimMaterial:new ce({color:M===1?"#344361":"#526572",transparent:!0,opacity:.6}));S.rotation.set(Math.PI/2+M*.045,.08*M,M*2.2),this.orbitalRings.add(S)}let y=new De(new Ke(1,.02,.02),new ce({color:16777215}),56);for(let M=0;M<56;M++){let S=M/56*Math.PI*2;this.dummy.position.set(Math.cos(S)*(m+.2),0,Math.sin(S)*(m+.2)),this.dummy.rotation.set(0,-S,0),this.dummy.scale.set(M%7===0?.3:.1,1,1),this.dummy.updateMatrix(),y.setMatrixAt(M,this.dummy.matrix),y.setColorAt(M,M%7===0?this.trimMaterial.color:new at("#415766"))}y.instanceMatrix.needsUpdate=!0,this.orbitalRings.add(y),this.board.add(this.orbitalRings);let w=new ee(new Ci(t*2,e*2),new ce({map:_,color:"#274775",transparent:!0,opacity:.3,depthWrite:!1,side:fi,blending:Fn}));w.rotation.x=-Math.PI/2,w.position.y=-3.8,this.board.add(w);let x=new De(new ss(1,0),a,22);for(let M=0;M<22;M++){let S=n()*Math.PI*2,A=m*(.95+n()*.32),v=.16+n()*.38;this.dummy.position.set(Math.cos(S)*A,-1.2-n()*2.8,Math.sin(S)*A),this.dummy.scale.set(v*.7,v*(.7+n()*1.4),v*1.1),this.dummy.rotation.set(n()*3,n()*3,n()*3),this.dummy.updateMatrix(),x.setMatrixAt(M,this.dummy.matrix)}x.instanceMatrix.needsUpdate=!0,this.board.add(x);for(let M of[-1,1])for(let S of[-1,1]){let A=new C(M*(t/2+.08),-.1,S*(e/2+.08)),v=new ee(new Bi(.055,.15,.75,5),o);v.position.copy(A).y+=.33;let E=new ee(new ki(.1),l);E.position.copy(A).y+=.77,this.board.add(v,E)}}createCursor(){this.cursor=new Ti;let t=new ce({color:"#d6f3e9",transparent:!0,opacity:.92});for(let e of[-1,1])for(let i of[-1,1]){let n=new ee(new Ke(.2,.016,.026),t);n.position.set(e*.42,0,i*.5);let r=new ee(new Ke(.026,.016,.2),t);r.position.set(e*.5,0,i*.42),this.cursor.add(n,r)}this.cursor.visible=!1,this.board.add(this.cursor)}createPulse(){this.pulse=new ee(new rs(.92,1,80),new ce({color:"#91dad8",side:fi,transparent:!0,opacity:0,depthWrite:!1})),this.pulse.rotation.x=-Math.PI/2,this.pulseAge=99,this.board.add(this.pulse)}drawTiles(){for(let t of this.presentation.cells){let e=this.position(t.id),i=this.motions[t.id],n=1-Math.pow(1-i,3),r=t.id===this.hoverId||t.id===this.focusId,a=t.revealed?.09+.22*(1-n):.31+(r?.045:0);this.setInstance(this.tiles,t.id,e.x,-.04,e.z,1,a/.27,1);let o=t.wrongFlag||t.exploded?cc.danger:r?cc.hover:t.flagged?cc.flagged:t.revealed?cc.open:cc.closed;this.tiles.setColorAt(t.id,o),this.dummy.position.set(e.x,a+.029,e.z),this.dummy.rotation.set(-Math.PI/2,0,0),this.dummy.scale.setScalar(t.revealed?0:1),this.dummy.updateMatrix(),this.slits.setMatrixAt(t.id,this.dummy.matrix),this.dummy.position.set(e.x,.13,e.z),this.dummy.rotation.set(-Math.PI/2,0,0),this.dummy.scale.setScalar(t.revealed&&!t.mine&&t.adjacent===0?1:0),this.dummy.updateMatrix(),this.innerLights.setMatrixAt(t.id,this.dummy.matrix)}this.tiles.instanceMatrix.needsUpdate=!0,this.tiles.instanceColor.needsUpdate=!0,this.slits.instanceMatrix.needsUpdate=!0,this.innerLights.instanceMatrix.needsUpdate=!0,this.refreshCursor()}drawSymbols(){let t=Array.from({length:8},()=>[]),e=0,i=0;for(let n of this.presentation.cells){let r=this.position(n.id);if(n.revealed&&n.adjacent>0&&!n.mine&&t[n.adjacent-1].push(r),n.wrongFlag)for(let a of[-Math.PI/4,Math.PI/4])this.dummy.position.set(r.x,.38,r.z),this.dummy.rotation.set(0,a,0),this.dummy.scale.setScalar(1),this.dummy.updateMatrix(),this.wrongMarks.setMatrixAt(i++,this.dummy.matrix);n.flagged&&!n.revealed&&!n.wrongFlag&&(this.setInstance(this.flagPoles,e,r.x,.59,r.z),this.setInstance(this.flagCrystals,e,r.x,1.03,r.z,.8,1.45,.8),this.dummy.position.set(r.x,.43,r.z),this.dummy.rotation.set(-Math.PI/2,0,0),this.dummy.scale.setScalar(1),this.dummy.updateMatrix(),this.flagRings.setMatrixAt(e,this.dummy.matrix),e++)}for(let n of[this.flagPoles,this.flagCrystals,this.flagRings])n.count=e,n.instanceMatrix.needsUpdate=!0,n.computeBoundingSphere();this.updateMineModels(),this.labels=t,this.wrongMarks.count=i,this.wrongMarks.instanceMatrix.needsUpdate=!0,this.wrongMarks.computeBoundingSphere(),this.updateLabels()}updateMineModels(){let t=[];for(let e of this.presentation.cells)!e.revealed||!e.mine||t.push({id:e.id,...this.position(e.id),...this.detonation.stage(e.id)});this.mines.update(t)}advanceDetonation(t){if(!this.detonation.active)return;let e=this.detonation.advance(t);if(e.revealed.length){this.presentation=this.detonation.present(this.snapshot);for(let i of e.revealed)this.motions[i]=this.reducedMotion.matches?1:0;this.drawTiles(),this.drawSymbols()}for(let i of e.explosions){let n=this.position(i.id);this.effects.trigger("lose",{...n,y:.48});let r=new C(n.x,.48,n.z).project(this.camera);this.callbacks.onExplosion?.({index:i.index,total:this.detonation.entries.length,pan:Math.max(-.8,Math.min(.8,r.x))})}e.revealed.length||this.updateMineModels(),e.finished&&this.callbacks.onChainComplete?.()}updateLabels(){this.labels&&this.labels.forEach((t,e)=>{let i=this.labelMeshes[e];i.count=t.length,t.forEach((n,r)=>{this.dummy.position.set(n.x,.32,n.z),this.dummy.quaternion.copy(this.camera.quaternion),this.dummy.scale.setScalar(1),this.dummy.updateMatrix(),i.setMatrixAt(r,this.dummy.matrix)}),i.instanceMatrix.needsUpdate=!0,i.computeBoundingSphere()})}refreshCursor(){if(!this.cursor)return;let t=this.hoverId>=0?this.hoverId:this.focusId;if(this.cursor.visible=t>=0,t>=0){let e=this.position(t);this.cursor.position.set(e.x,.42,e.z)}}position(t){return{x:(t%this.width-(this.width-1)/2)*1.06,z:(Math.floor(t/this.width)-(this.height-1)/2)*1.06}}setInstance(t,e,i,n,r,a=1,o=1,l=1){this.dummy.position.set(i,n,r),this.dummy.rotation.set(0,0,0),this.dummy.scale.set(a,o,l),this.dummy.updateMatrix(),t.setMatrixAt(e,this.dummy.matrix)}pick(t){if(!this.colliders)return-1;let e=this.renderer.domElement.getBoundingClientRect();return this.pointer.set((t.clientX-e.left)/e.width*2-1,-(t.clientY-e.top)/e.height*2+1),this.camera.updateMatrixWorld(),this.board.updateMatrixWorld(!0),this.raycaster.setFromCamera(this.pointer,this.camera),this.raycaster.intersectObject(this.colliders,!1)[0]?.instanceId??-1}bindEvents(){let t=this.renderer.domElement;t.addEventListener("contextmenu",e=>e.preventDefault()),t.addEventListener("webglcontextlost",e=>{e.preventDefault(),this.callbacks.onFailure(new Error("WebGL context lost"))}),t.addEventListener("pointerdown",e=>{if(this.clearFocus(),this.pointers.add(e.pointerId),this.pointers.size>1){this.pointerState&&(this.pointerState.cancelled=!0),clearTimeout(this.longPressTimer);return}let i=this.pick(e);this.pointerState={x:e.clientX,y:e.clientY,id:i,button:e.button,cancelled:!1,consumed:!1},e.pointerType==="touch"&&i>=0&&(this.longPressTimer=setTimeout(()=>{this.pointerState&&!this.pointerState.cancelled&&(this.pointerState.consumed=!0,this.callbacks.onFlag(i))},480))}),t.addEventListener("pointermove",e=>{this.pointerState&&Math.hypot(e.clientX-this.pointerState.x,e.clientY-this.pointerState.y)>6&&(this.pointerState.cancelled=!0,clearTimeout(this.longPressTimer));let i=this.pick(e),n=this.focusId>=0;this.focusId=-1,(i!==this.hoverId||n)&&(this.hoverId=i,t.style.cursor=i>=0?"crosshair":this.pointerState?"grabbing":"grab",this.drawTiles(),this.callbacks.onHover(i))}),t.addEventListener("pointerleave",()=>{this.hoverId=-1,this.drawTiles(),this.callbacks.onHover(-1)}),t.addEventListener("pointerup",e=>{let i=this.pointerState;e.pointerType!=="mouse"&&(this.hoverId=-1,this.focusId=-1,this.drawTiles()),this.pointers.delete(e.pointerId),clearTimeout(this.longPressTimer),this.pointers.size===0&&(this.pointerState=null),i?.cancelled&&(this.suppressDoubleClickUntil=performance.now()+450),!(!i||i.cancelled||i.consumed||i.id<0)&&(Math.hypot(e.clientX-i.x,e.clientY-i.y)>6||(e.button===2||this.mode==="flag"?this.callbacks.onFlag(i.id):e.button===0&&this.callbacks.onReveal(i.id)))}),t.addEventListener("pointercancel",e=>{this.pointers.delete(e.pointerId),this.pointerState=null,this.hoverId=-1,this.focusId=-1,this.drawTiles(),clearTimeout(this.longPressTimer)}),t.addEventListener("dblclick",e=>{if(performance.now()<(this.suppressDoubleClickUntil||0))return;let i=this.pick(e);i>=0&&this.callbacks.onChord(i)}),this.controls.addEventListener("change",()=>this.updateLabels())}animate(t){if(this.frame=null,this.disposed||document.hidden)return;let e=Math.max(0,(t-this.lastTime)/1e3),i=Math.min(e,.1);this.lastTime=t,this.controls.update(),this.cosmos.update(t/1e3,this.reducedMotion.matches),this.effects.update(e,t/1e3);let n=this.fireworks.active;this.fireworks.update(e),n&&!this.fireworks.active&&this.callbacks.onFireworksStop?.(),this.advanceDetonation(e);let r=!1;for(let a=0;a<this.motions.length;a++)this.motions[a]<1&&(this.motions[a]=Math.min(1,this.motions[a]+i*3.8),r=!0);r&&this.drawTiles(),this.pulse&&this.pulseAge<1.1&&(this.pulseAge+=i,this.pulse.scale.setScalar(.3+this.pulseAge*4),this.pulse.material.opacity=Math.max(0,(1-this.pulseAge)*.35)),this.orbitalRings&&!this.reducedMotion.matches&&(this.orbitalRings.rotation.y=t*4e-5,this.core.material.emissiveIntensity=1.05+Math.sin(t*.0018)*.06),this.composer.render(),this.frame=requestAnimationFrame(a=>this.animate(a))}disposeGroup(t){let e=new Set,i=new Set;t.traverse(n=>{n.isInstancedMesh&&n.dispose(),n.geometry&&e.add(n.geometry),n.material&&(Array.isArray(n.material)?n.material:[n.material]).forEach(r=>i.add(r))}),e.forEach(n=>n.dispose()),i.forEach(n=>n.dispose())}dispose(){this.disposed=!0,cancelAnimationFrame(this.frame),clearTimeout(this.longPressTimer),document.removeEventListener("visibilitychange",this.onVisibility),this.resizeObserver.disconnect(),this.controls.dispose(),this.cosmos.dispose(),this.effects.dispose(),this.fireworks.dispose(),this.callbacks.onFireworksStop?.(),this.detonation.reset(),this.mines?.dispose(),this.disposeGroup(this.scene),this.textures.forEach(t=>t.dispose()),this.composer.passes.forEach(t=>t.dispose()),this.composer.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function y0(s,t,e){return aw(s,s,t,e)}function aw(s,t,e,i){let n=new zi,r=-s/2,a=-t/2,o=i;n.moveTo(r+o,a),n.lineTo(r+s-o,a),n.quadraticCurveTo(r+s,a,r+s,a+o),n.lineTo(r+s,a+t-o),n.quadraticCurveTo(r+s,a+t,r+s-o,a+t),n.lineTo(r+o,a+t),n.quadraticCurveTo(r,a+t,r,a+t-o),n.lineTo(r,a+o),n.quadraticCurveTo(r,a,r+o,a);let l=new Hs(n,{depth:e,bevelEnabled:!0,bevelSegments:2,steps:1,bevelSize:i*.4,bevelThickness:i*.4,curveSegments:3});return l.rotateX(-Math.PI/2),l}function ow(s){let t=document.createElement("canvas");t.width=t.height=128;let e=t.getContext("2d"),i=["#b8f0ef","#a9d4c0","#efc390","#b6b8e6","#eea2a0","#96ccd7","#e0d6bf","#f3ede4"];e.font="600 96px ui-monospace, SFMono-Regular, Menlo, monospace",e.textAlign="center",e.textBaseline="middle",e.shadowColor="rgba(10, 24, 35, 0.9)",e.shadowBlur=7,e.fillStyle=i[s-1],e.fillText(String(s),64,69);let n=new fn(t);return n.colorSpace=Be,n}function lw(){let s=document.createElement("canvas");s.width=s.height=128;let t=s.getContext("2d"),e=t.createRadialGradient(64,64,0,64,64,64);return e.addColorStop(0,"rgba(255,255,255,0.9)"),e.addColorStop(.42,"rgba(255,255,255,0.4)"),e.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=e,t.fillRect(0,0,128,128),new fn(s)}function cw(){let s=document.createElement("canvas");s.width=s.height=128;let t=s.getContext("2d");t.strokeStyle="#b3eff3",t.lineWidth=1.3;for(let[e,i,n,r]of[[12,12,1,1],[116,12,-1,1],[12,116,1,-1],[116,116,-1,-1]])t.beginPath(),t.moveTo(e,i+r*13),t.lineTo(e,i),t.lineTo(e+n*13,i),t.stroke();return t.strokeStyle="rgba(179,239,243,0.7)",t.beginPath(),t.moveTo(64,57),t.lineTo(71,64),t.lineTo(64,71),t.lineTo(57,64),t.closePath(),t.stroke(),new fn(s)}function M0(s){return()=>(s=s*1664525+1013904223>>>0,s/4294967296)}var zu=class{constructor(){this.enabled=!0,this.musicEnabled=!0,this.context=null,this.mood="ready",this.unlocked=!1,this.disposed=!1,this.voices=new Set,this.scheduler=null,this.beat=0,this.nextBeatAt=0,this.onVisibility=()=>this.handleVisibility(),globalThis.document?.addEventListener("visibilitychange",this.onVisibility)}async unlock(){if(this.disposed||this.isHidden())return!1;if(!this.context){let t=globalThis.AudioContext||globalThis.webkitAudioContext;if(!t)return!1;try{this.context=new t({latencyHint:"interactive"}),this.createGraph()}catch{try{await this.context?.close()}catch{}return this.context=null,!1}}if(this.context.state==="closed")return!1;this.unlocked=!0;try{return this.context.state!=="running"&&await this.context.resume(),this.disposed||this.isHidden()?(await this.context.suspend().catch(()=>{}),!1):(this.syncGains(),this.startMusic(),this.context.state==="running")}catch{return this.stopMusic(),!1}}setEnabled(t){this.enabled=!!t,this.setBus(this.sfxGain,this.enabled?.78:0),this.enabled||this.stopVoices("sfx")}setMusicEnabled(t){this.musicEnabled=!!t,this.setBus(this.musicGain,this.musicLevel()),this.musicEnabled?this.startMusic():this.stopMusic()}play(t){if(t==="lose"){this.playExplosion();return}if(!this.canPlay("sfx"))return;let e=t==="win"?[440,523.25,659.25,880]:t==="flag"?[659.25,987.77]:t==="unflag"?[493.88,329.63]:t==="chord"?[329.63,493.88,659.25]:t==="reveal"?[261.63,392]:[],i=this.context.currentTime+.005;e.forEach((n,r)=>this.tone(n,i+r*.065,t==="win"?.5:.2,.045,"sfx"))}playExplosion({index:t=0,total:e=1,pan:i=0}={}){if(!this.canPlay("sfx"))return;let n=this.context,r=Number.isFinite(t)?Math.max(0,Math.floor(t)):0,a=Number.isFinite(e)?Math.max(1,e):1,o=(r*37+11)%23/23,l=r===0?1:(.66+o*.17)*(a>40?.88:1),c=n.currentTime+.004,h=[...this.voices].filter(A=>A.group==="sfx"&&A.explosion),d=r<3?1:Math.min(1,Math.sqrt(3/(h.length+1)));h.length>=9&&h[0].stop();let u=n.createGain();u.gain.value=l*d;let f=n.createStereoPanner?n.createStereoPanner():n.createGain();f.pan&&(f.pan.value=Number.isFinite(i)?Math.max(-1,Math.min(1,i)):0),u.connect(f),f.connect(this.sfxGain);let p=[u,f],_=[],g=n.createBufferSource();g.buffer=this.noiseBuffer,g.playbackRate.value=.82+o*.35;let m=n.createBiquadFilter();m.type="lowpass",m.Q.value=.8,m.frequency.setValueAtTime(1750+o*700,c),m.frequency.exponentialRampToValueAtTime(125,c+.34);let y=n.createGain();this.envelope(y.gain,c,.004,.29,.38),g.connect(m).connect(y).connect(u),p.push(m,y),_.push({source:g,at:c,duration:.41,offset:o*.3});for(let A=0;A<2;A+=1){let v=n.createOscillator(),E=n.createGain();v.type=A===0?"sine":"triangle",v.frequency.setValueAtTime((A===0?132:73)*(.9+o*.22),c),v.frequency.exponentialRampToValueAtTime(A===0?34:27,c+.38),this.envelope(E.gain,c,.003,A===0?.4:.09,A===0?.6:.35),v.connect(E).connect(u),p.push(E),_.push({source:v,at:c,duration:A===0?.64:.39})}let w=n.createBufferSource();w.buffer=this.noiseBuffer,w.playbackRate.value=1.25+o*.5;let x=n.createBiquadFilter();x.type="bandpass",x.frequency.setValueAtTime(3400+o*1900,c),x.frequency.exponentialRampToValueAtTime(1550,c+.72),x.Q.value=1.9;let M=n.createGain();this.envelope(M.gain,c+.028,.015,.105,.78),w.connect(x).connect(M).connect(u),p.push(x,M),_.push({source:w,at:c+.028,duration:.81,offset:.4});let S=this.registerVoice(_,p,"sfx");S&&(S.explosion=!0)}playFirework(t,{strength:e=1,pan:i=0}={}){if(t!=="launch"&&t!=="burst"||!this.canPlay("sfx"))return;let n=Number.isFinite(e)?Math.max(0,Math.min(1.5,e)):1;if(n===0)return;let r=[...this.voices].filter(y=>y.firework);r.length>=4&&r.shift().stop();let a=this.context,o=a.currentTime+.004,l=t==="launch",c=a.createGain();c.gain.value=n*Math.min(1,Math.sqrt(2/(r.length+1)));let h=a.createStereoPanner?a.createStereoPanner():a.createGain();h.pan&&(h.pan.value=Number.isFinite(i)?Math.max(-1,Math.min(1,i)):0),c.connect(h),h.connect(this.sfxGain);let d=[c,h],u=[],f=a.createBufferSource();f.buffer=this.noiseBuffer,f.playbackRate.value=l?.9:1.35;let p=a.createBiquadFilter();p.type="bandpass",p.Q.value=l?1.1:.8,p.frequency.setValueAtTime(l?700:1850,o),p.frequency.exponentialRampToValueAtTime(l?2250:1100,o+(l?.38:.085));let _=a.createGain();this.envelope(_.gain,o,l?.065:.003,l?.025:.065,l?.42:.105),f.connect(p).connect(_).connect(c),d.push(p,_),u.push({source:f,at:o,duration:l?.46:.14,offset:l?.15:.65}),(l?[880]:[1760,2637.02]).forEach((y,w)=>{let x=a.createOscillator(),M=a.createGain(),S=o+(l?.025:.022+w*.055),A=l?.36:.25+w*.06;x.type="sine",x.frequency.setValueAtTime(y,S),x.frequency.exponentialRampToValueAtTime(l?1760:y*.985,S+A),this.envelope(M.gain,S,l?.05:.005,l?.007:.009/(w+1),A),x.connect(M).connect(c),d.push(M),u.push({source:x,at:S,duration:A+.03})});let m=this.registerVoice(u,d,"sfx");m&&(m.firework=!0,m.fireworkPhase=t)}get fireworkVoiceCount(){let t=0;for(let e of this.voices)e.firework&&(t+=1);return t}stopFireworks(){for(let t of[...this.voices])t.firework&&t.stop()}setMood(t){if(["ready","playing","lost","won"].includes(t)&&(this.mood=t,this.musicGain&&this.context?.state!=="closed")){let e=this.context.currentTime;this.musicGain.gain.cancelScheduledValues(e),this.musicGain.gain.setTargetAtTime(this.musicLevel(),e,.15)}}reset(){this.disposed||(this.stopVoices("sfx"),this.stopMusic(),this.beat=0,this.setMood("ready"),this.startMusic())}dispose(){if(!this.disposed){this.disposed=!0,globalThis.document?.removeEventListener("visibilitychange",this.onVisibility),this.stopMusic(),this.stopVoices("sfx");for(let t of[this.sfxGain,this.musicGain,this.compressor,this.masterGain])try{t?.disconnect()}catch{}this.context&&(this.context.onstatechange=null,this.context.state!=="closed"&&this.context.close().catch(()=>{})),this.noiseBuffer=null}}createGraph(){let t=this.context;this.sfxGain=t.createGain(),this.musicGain=t.createGain(),this.compressor=t.createDynamicsCompressor(),this.masterGain=t.createGain(),this.compressor.threshold.value=-17,this.compressor.knee.value=20,this.compressor.ratio.value=4,this.compressor.attack.value=.006,this.compressor.release.value=.18,this.masterGain.gain.value=.7,this.sfxGain.connect(this.compressor),this.musicGain.connect(this.compressor),this.compressor.connect(this.masterGain).connect(t.destination),this.noiseBuffer=t.createBuffer(1,Math.ceil(t.sampleRate*2),t.sampleRate);let e=this.noiseBuffer.getChannelData(0);for(let i=0;i<e.length;i+=1)e[i]=Math.random()*2-1;this.syncGains(),t.onstatechange=()=>{this.disposed||(t.state==="running"&&!this.isHidden()?this.startMusic():this.stopMusic())}}canPlay(t){return!this.disposed&&!this.isHidden()&&this.context?.state==="running"&&(t==="music"?this.musicEnabled:this.enabled)}isHidden(){return globalThis.document?.hidden===!0}setBus(t,e){if(!(!t||!this.context||this.context.state==="closed"))try{t.gain.cancelScheduledValues(0),t.gain.value=e,t.gain.setValueAtTime(e,this.context.currentTime)}catch{}}syncGains(){this.setBus(this.sfxGain,this.enabled?.78:0),this.setBus(this.musicGain,this.musicLevel())}musicLevel(){return this.musicEnabled?this.mood==="lost"?.085:this.mood==="won"?.19:.2:0}envelope(t,e,i,n,r){t.setValueAtTime(0,e),t.linearRampToValueAtTime(n,e+i),t.exponentialRampToValueAtTime(1e-4,e+r),t.linearRampToValueAtTime(0,e+r+.02)}registerVoice(t,e,i){if(!this.context||this.context.state==="closed"||this.disposed){for(let r of[...t.map(a=>a.source),...e])try{r.disconnect()}catch{}return null}let n={group:i,sources:t.map(r=>r.source),ended:0,cleaned:!1};n.cleanup=()=>{if(!n.cleaned){n.cleaned=!0,this.voices.delete(n);for(let r of[...n.sources,...e])try{r.disconnect()}catch{}}},n.stop=()=>{for(let r of n.sources)try{r.stop()}catch{}n.cleanup()},this.voices.add(n);try{for(let r of t)r.source.onended=()=>{n.ended+=1,n.ended===t.length&&n.cleanup()},r.offset!==void 0?r.source.start(r.at,r.offset):r.source.start(r.at),r.source.stop(r.at+r.duration)}catch{return n.stop(),null}return n}stopVoices(t){for(let e of[...this.voices])e.group===t&&e.stop()}tone(t,e,i,n,r){if(!this.canPlay(r))return;let a=this.context.createOscillator(),o=this.context.createGain();a.type="sine",a.frequency.setValueAtTime(t,e),this.envelope(o.gain,e,.006,n,i),a.connect(o).connect(r==="music"?this.musicGain:this.sfxGain),this.registerVoice([{source:a,at:e,duration:i+.03}],[o],r)}startMusic(){this.scheduler!==null||!this.unlocked||!this.canPlay("music")||(this.nextBeatAt=this.context.currentTime+.035,this.beat-=this.beat%8,this.scheduler=setInterval(()=>this.scheduleMusic(),60),this.scheduleMusic())}stopMusic(){this.scheduler!==null&&clearInterval(this.scheduler),this.scheduler=null,this.stopVoices("music")}scheduleMusic(){if(!this.canPlay("music")){this.stopMusic();return}let t=this.context.currentTime;this.nextBeatAt<t-.2&&(this.nextBeatAt=t+.025,this.beat-=this.beat%8);let e=0;for(;this.nextBeatAt<t+.18&&e<4;)this.scheduleBeat(this.beat,this.nextBeatAt),this.nextBeatAt+=60/52,this.beat+=1,e+=1}scheduleBeat(t,e){let i=[[57,60,64],[53,57,60],[48,55,60],[55,59,62]],n=i[Math.floor(t/8)%i.length];if(t%8===0&&this.pad(n,e,60/52*8+.65),t%4===2&&this.mood!=="lost"){let a=440*2**((n[Math.floor(t/4)%n.length]+12-69)/12);this.tone(a,e,1.65,.052,"music"),this.tone(a*2.004,e+.012,.9,.008,"music")}if(t%2===0&&this.mood!=="lost"){let r=this.context.createOscillator(),a=this.context.createGain();r.type="sine",r.frequency.setValueAtTime(62,e),r.frequency.exponentialRampToValueAtTime(43,e+.32),this.envelope(a.gain,e,.03,.07,.37),r.connect(a).connect(this.musicGain),this.registerVoice([{source:r,at:e,duration:.42}],[a],"music")}}pad(t,e,i){let n=this.context,r=n.createBiquadFilter();r.type="lowpass",r.Q.value=.5,r.frequency.setValueAtTime(this.mood==="lost"?330:640,e),r.frequency.linearRampToValueAtTime(this.mood==="lost"?260:850,e+i*.45),r.frequency.linearRampToValueAtTime(420,e+i);let a=n.createGain();a.gain.setValueAtTime(0,e),a.gain.linearRampToValueAtTime(.06,e+1.25),a.gain.setValueAtTime(.06,e+i-1.45),a.gain.linearRampToValueAtTime(0,e+i),r.connect(a).connect(this.musicGain);let o=[];for(let l of t)for(let c of[-4,4]){let h=n.createOscillator();h.type=c<0?"sine":"triangle",h.frequency.value=440*2**((l-69)/12),h.detune.value=c,h.connect(r),o.push({source:h,at:e,duration:i+.025})}this.registerVoice(o,[r,a],"music")}async handleVisibility(){if(!(!this.context||this.disposed||this.context.state==="closed"))if(this.isHidden()){this.stopMusic(),this.stopVoices("sfx");try{await this.context.suspend()}catch{}}else this.unlocked&&(this.enabled||this.musicEnabled)&&await this.unlock()}};var b0=new C(0,1,0),kn={closed:new at("#3a4c5c"),open:new at("#14323a"),flagged:new at("#494239"),mine:new at("#59362d"),neighbor:new at("#4d737c"),selected:new at("#73898a"),edge:new at("#71818b"),side:new at("#17232d")},ku=class extends za{constructor(t,e){super(t,e),this.controls.minPolarAngle=.001,this.controls.maxPolarAngle=Math.PI-.001,this.controls.enablePan=!1,this.controls.touches.TWO=Mi.DOLLY_ROTATE,this.controls.maxZoom=4,this.controls.rotateSpeed=.7,this.surfaceView=!0,this.cosmos.setPlanetVisible(!1),this.highlightedIds=[],this.activeCellId=-1,this.renderer.toneMappingExposure=1.2,this.scene.add(new Ks("#acc7d8",.85)),this.bloom.strength=.3,this.bloom.threshold=1.1}rebuild(t){if(t.topology?.kind!=="surface")throw new TypeError("SurfaceScene requires a surface topology");this.detonation.reset(),this.fireworks.clear(),this.callbacks.onFireworksStop?.(),this.effects.clear(),this.mines?.dispose(),this.disposeGroup(this.board),this.board.clear(),this.textures.forEach(i=>i.dispose()),this.textures=[],this.snapshot=null,this.topology=t.topology,this.surfaceCells=this.topology.cells,this.width=t.width,this.height=t.height,this.count=this.surfaceCells.length,this.radius=this.topology.radius,this.hoverId=this.focusId=-1,this.drawnReveals=null,this.motions=new Float32Array(this.count).fill(1),this.maxDegree=Math.max(1,...this.surfaceCells.map(i=>i.neighbors.length)),this.labels=Array.from({length:this.maxDegree},()=>[]);let e=this.surfaceCells[0].corners;this.cellSize=new C().fromArray(e[0]).distanceTo(new C().fromArray(e[1])),this.cellFrames=this.surfaceCells.map(i=>{let n=new C().fromArray(i.center),r=new C().fromArray(i.normal).normalize(),a=new C().fromArray(i.corners[1]).sub(new C().fromArray(i.corners[0])).normalize(),o=new C().crossVectors(r,a).normalize();return{center:n,normal:r,tangentU:a,tangentV:o,labelRotation:new Te().setFromRotationMatrix(new Ht().makeBasis(a,o,r)),rotation:new Te().setFromUnitVectors(b0,r),scale:this.cellSize}}),this.createSurfaceGeometry(),this.createSurfaceSymbols(),this.mines=new Ba(ds,Math.max(1,t.mines)),this.board.add(this.mines.group),this.update(t),this.resetCamera()}createSurfaceGeometry(){let t=[],e=[],i=[],n=[],r=[],a=[],o=new C;for(let u of this.surfaceCells){let f=this.cellFrames[u.id];for(let x of[[0,1,2],[0,2,3]]){for(let M of x)t.push(...u.corners[M]);i.push(u.id)}let p=e.length/3,_=(x,M)=>[[-x,-x,M],[x,-x,M],[x,x,M],[-x,x,M]],g=_(.442,0),m=_(.47,1),y=_(.47,2),w=x=>{for(let[M,S,A]of x)o.copy(f.center).addScaledVector(f.tangentU,M*f.scale).addScaledVector(f.tangentV,S*f.scale),o.addScaledVector(f.normal,(A===0?.06:A===1?.032:.004)*f.scale),e.push(o.x,o.y,o.z),a.push(M,S),r.push(A)};w([g[0],g[1],g[2],g[0],g[2],g[3]]);for(let x=0;x<4;x++){let M=(x+1)%4;w([g[x],m[x],m[M],g[x],m[M],g[M]]),w([m[x],y[x],y[M],m[x],y[M],m[M]])}n[u.id]={start:p,count:e.length/3-p}}this.tileRanges=n,this.tileVertexRoles=new Uint8Array(r),this.tileLocalCoordinates=new Float32Array(a),this.triangleCellIds=i;let l=new kt;l.setAttribute("position",new vt(t,3)),l.computeVertexNormals(),this.colliders=new ee(l,new Ge({color:"#101a22",roughness:.88,metalness:.25,flatShading:!0})),this.colliders.name="solid-unit-square-occluder",this.board.add(this.colliders);let c=new kt;c.setAttribute("position",new vt(e,3).setUsage(us)),c.setAttribute("color",new he(new Float32Array(e.length),3).setUsage(us)),c.computeVertexNormals(),this.tiles=new ee(c,new Ge({vertexColors:!0,metalness:.48,roughness:.56,flatShading:!0})),this.tiles.name="solid-equal-square-alloy-covers",this.board.add(this.tiles);let h=new zi;h.moveTo(-.478,-.478),h.lineTo(.478,-.478),h.lineTo(.478,.478),h.lineTo(-.478,.478),h.closePath();let d=new pn;d.moveTo(-.465,-.465),d.lineTo(-.465,.465),d.lineTo(.465,.465),d.lineTo(.465,-.465),d.closePath(),h.holes.push(d),this.selectionOutline=new ee(new Ws(h),new ce({color:"#d7b77c",depthTest:!0,toneMapped:!1})),this.selectionOutline.name="solid-selected-face-outline",this.selectionOutline.visible=!1,this.board.add(this.selectionOutline)}createSurfaceSymbols(){let t=(e,i,n,r=this.count)=>{let a=new De(i,n,r);return a.name=e,a.count=0,a.frustumCulled=!1,a.instanceMatrix.setUsage(us),this.board.add(a),a};this.labelMeshes=Array.from({length:this.maxDegree},(e,i)=>{let n=uw(i+1);this.textures.push(n);let r=t(`surface-number-${i+1}`,new Ci(.57,.63),new ce({map:n,transparent:!0,alphaTest:.15,depthTest:!0,depthWrite:!1,toneMapped:!1}));return r.renderOrder=3,r.userData.cellIds=[],r}),this.flagPoles=t("surface-beacon-stems",new Bi(.021,.029,.44,6),new Ge({color:"#dfbd7f",metalness:.65,roughness:.38})),this.flagCrystals=t("surface-beacon-lanterns",new ki(.125,0),new Ge({color:"#efbc70",emissive:"#ae6f26",emissiveIntensity:.55,metalness:.4,roughness:.38})),this.flagRings=t("surface-beacon-footings",new en(.16,.016,5,20).rotateX(Math.PI/2),new ce({color:"#cca465"})),this.wrongMarks=t("surface-wrong-flags",new Ke(.5,.035,.045),new ce({color:"#ed9585"}),this.count*2)}update(t,e={changed:[],action:"noop"}){let i=this.snapshot?.status;if(this.snapshot=t,!!this.tiles&&(e.action==="lose"&&this.startSurfaceDetonation(t),this.presentation=this.detonation.present(t),this.drawTiles(),this.drawSymbols(),t.status==="won"&&i!=="won")){let n=this.camera.position.clone().normalize();this.fireworks.root.position.copy(n.multiplyScalar(this.radius*.9)),this.fireworks.root.quaternion.copy(this.camera.quaternion),this.fireworks.root.scale.setScalar(this.radius/4.3),this.fireworks.start({width:8,height:6})}}drawTiles(){if(!this.tiles||!this.presentation)return;let t=this.hoverId>=0?this.hoverId:this.focusId;this.activeCellId=t,this.highlightedIds=t>=0?[t,...this.surfaceCells[t].neighbors]:[];let e=new Set(this.highlightedIds),i=this.tiles.geometry.attributes.position,n=this.tiles.geometry.attributes.color,r=new C,a=new at,o=new at,l=!1;this.drawnReveals??=new Uint8Array(this.count).fill(2);for(let c of this.presentation.cells){let h=this.cellFrames[c.id],d=this.tileRanges[c.id],u=c.revealed?c.mine?kn.mine:kn.open:c.flagged?kn.flagged:kn.closed;a.copy(u),c.id===t?a.lerp(kn.selected,.28):e.has(c.id)&&a.lerp(kn.neighbor,.3),a.multiplyScalar(.97+hw(c.id+(Number(this.topology.seed)||1))*.06);let f=Number(c.revealed),p=this.drawnReveals[c.id]!==f;for(let _=d.start;_<d.start+d.count;_++){let g=this.tileVertexRoles[_];if(p){let m=g===0?c.revealed?.012:.06:g===1?.032:.004;r.copy(h.center).addScaledVector(h.tangentU,this.tileLocalCoordinates[_*2]*h.scale).addScaledVector(h.tangentV,this.tileLocalCoordinates[_*2+1]*h.scale).addScaledVector(h.normal,m*h.scale),i.setXYZ(_,r.x,r.y,r.z)}o.copy(g===0?a:g===1?kn.edge:kn.side),g===1&&e.has(c.id)&&o.lerp(kn.selected,.2),n.setXYZ(_,o.r,o.g,o.b)}l||=p,this.drawnReveals[c.id]=f}n.needsUpdate=!0,l&&(i.needsUpdate=!0,this.tiles.geometry.computeVertexNormals(),this.tiles.geometry.computeBoundingSphere()),this.refreshCursor()}refreshCursor(){if(!this.selectionOutline||!this.cellFrames)return;let t=this.hoverId>=0?this.hoverId:this.focusId;if(this.selectionOutline.visible=t>=0,t<0)return;let e=this.cellFrames[t];this.selectionOutline.position.copy(e.center).addScaledVector(e.normal,e.scale*.072),this.selectionOutline.quaternion.copy(e.labelRotation),this.selectionOutline.scale.setScalar(e.scale)}drawSymbols(){if(!this.presentation)return;this.labels=Array.from({length:this.maxDegree},()=>[]);let t=0,e=0;for(let i of this.presentation.cells){i.revealed&&!i.mine&&i.adjacent>0&&this.labels[i.adjacent-1]?.push(i.id);let n=this.cellFrames[i.id];if(i.wrongFlag)for(let r of[-Math.PI/4,Math.PI/4])this.placeSurface(this.wrongMarks,e++,n,.15,1,new Te().setFromAxisAngle(b0,r));else i.flagged&&!i.revealed&&(this.placeSurface(this.flagPoles,t,n,.34),this.placeSurface(this.flagCrystals,t,n,.61),this.placeSurface(this.flagRings,t,n,.12),t++)}for(let i of[this.flagPoles,this.flagCrystals,this.flagRings])i.count=t,i.instanceMatrix.needsUpdate=!0;this.wrongMarks.count=e,this.wrongMarks.instanceMatrix.needsUpdate=!0,this.updateMineModels(),this.updateLabels()}placeSurface(t,e,i,n,r=1,a=null){this.dummy.position.copy(i.center).addScaledVector(i.normal,n*i.scale),this.dummy.quaternion.copy(i.rotation),a&&this.dummy.quaternion.multiply(a),this.dummy.scale.setScalar(i.scale*r),this.dummy.updateMatrix(),t.setMatrixAt(e,this.dummy.matrix)}updateLabels(){if(!this.labels||!this.cellFrames)return;this.camera.updateMatrixWorld();let t=this.camera.position.clone().sub(this.controls.target).normalize();this.visibleLabelIds=[],this.labels.forEach((e,i)=>{let n=this.labelMeshes[i],r=0;n.userData.cellIds=[];for(let a of e){let o=this.cellFrames[a];o.normal.dot(t)<.025||(this.dummy.position.copy(o.center).addScaledVector(o.normal,.016*o.scale),this.dummy.quaternion.copy(o.labelRotation),this.dummy.scale.setScalar(o.scale),this.dummy.updateMatrix(),n.setMatrixAt(r++,this.dummy.matrix),n.userData.cellIds.push(a),this.visibleLabelIds.push(a))}n.count=r,n.instanceMatrix.needsUpdate=!0})}updateMineModels(){let t=[];for(let e of this.presentation.cells){if(!e.revealed||!e.mine)continue;let i=this.cellFrames[e.id],n=i.center.clone().addScaledVector(i.normal,i.scale*.3);t.push({id:e.id,x:n.x,y:n.y,z:n.z,normal:i.normal.toArray(),scale:i.scale*.86,...this.detonation.stage(e.id)})}this.mines.update(t)}startSurfaceDetonation(t){let e=t.cells.find(r=>r.exploded)?.id;if(e===void 0)return;let i=new Float64Array(this.count).fill(1/0),n=new Uint8Array(this.count);i[e]=0;for(let r=0;r<this.count;r++){let a=-1,o=1/0;for(let l=0;l<this.count;l++)!n[l]&&i[l]<o&&(a=l,o=i[l]);if(a<0)break;n[a]=1;for(let l of this.surfaceCells[a].neighbors){let c=o+this.cellFrames[a].center.distanceTo(this.cellFrames[l].center);c<i[l]&&(i[l]=c)}}this.detonation.start({...t,cells:t.cells.map(r=>({...r,x:i[r.id],y:0}))})}advanceDetonation(t){if(!this.detonation.active)return;let e=this.detonation.advance(t);e.revealed.length&&(this.presentation=this.detonation.present(this.snapshot),this.drawTiles(),this.drawSymbols());for(let i of e.explosions){let n=this.cellFrames[i.id],r=n.center.clone().addScaledVector(n.normal,n.scale*.24);this.reducedMotion.matches||this.effects.flames.trigger({x:r.x,y:r.y,z:r.z,normal:n.normal.toArray(),scale:n.scale*.85});let a=r.project(this.camera);this.callbacks.onExplosion?.({index:i.index,total:this.detonation.entries.length,pan:Ia.clamp(a.x,-.8,.8)})}this.updateMineModels(),e.finished&&this.callbacks.onChainComplete?.()}position(t){let e=this.cellFrames?.[t]?.center;return e?{x:e.x,y:e.y,z:e.z}:{x:0,y:0,z:0}}projectCell(t){let e=this.cellFrames?.[t];if(!e)return{x:NaN,y:NaN,visible:!1};this.camera.updateMatrixWorld();let i=e.center.clone().addScaledVector(e.normal,.018*e.scale).project(this.camera),n=this.renderer.domElement.getBoundingClientRect(),r=this.camera.position.clone().sub(this.controls.target).normalize(),a=n.left+(i.x+1)*n.width/2,o=n.top+(1-i.y)*n.height/2;return{x:a,y:o,visible:e.normal.dot(r)>.1&&Math.abs(i.x)<1&&Math.abs(i.y)<1&&Math.abs(i.z)<1&&this.pick({clientX:a,clientY:o})===t}}pick(t){if(!this.colliders)return-1;let e=this.renderer.domElement.getBoundingClientRect();if(!e.width||!e.height)return-1;this.pointer.set((t.clientX-e.left)/e.width*2-1,1-(t.clientY-e.top)/e.height*2),this.camera.updateMatrixWorld(),this.board.updateMatrixWorld(!0),this.raycaster.setFromCamera(this.pointer,this.camera);let i=this.raycaster.intersectObject(this.colliders,!1)[0];return!i||i.face.normal.dot(this.raycaster.ray.direction)>=0?-1:this.triangleCellIds[i.faceIndex]??-1}focus(t){if(!this.cellFrames?.[t])return;this.hoverId=-1,this.focusId=t;let e=this.cellFrames[t],i=this.projectCell(t),n=this.camera.position.clone().sub(this.controls.target).normalize();(!i.visible||e.normal.dot(n)<.42)&&this.setCameraDirection(e.normal,e.center),this.drawTiles(),this.updateLabels()}focusCell(t){this.focus(t)}setCameraDirection(t,e=new C){let i=this.controls.enableDamping;this.controls.enableDamping=!1,this.controls.update(),this.controls.target.copy(e),this.camera.position.copy(t).normalize().multiplyScalar(Math.max(24,(this.radius||4.3)*4)).add(e),this.camera.lookAt(e),this.controls.update(),this.controls.enableDamping=i,this.updateLabels()}resetCamera(t=!0){t&&(this.camera.zoom=1),this.setCameraDirection(this.topView?new C(0,1,.001):new C().fromArray(this.topology?.viewDirection||[1.25,.9,1.5])),this.resize(),this.refreshCursor()}setTopView(t){this.topView=!!t,this.controls.enableRotate=!0,this.resetCamera(!1)}resize(){let t=this.container.clientWidth,e=this.container.clientHeight;if(!t||!e)return;this.renderer.setSize(t,e),this.composer.setSize(t,e);let i=t/e,n=(this.radius||4.3)*1.22/Math.min(1,i);this.camera.left=-n*i,this.camera.right=n*i,this.camera.top=n,this.camera.bottom=-n,this.camera.updateProjectionMatrix()}bindEvents(){super.bindEvents(),this.releaseGuard=t=>{this.pointerState&&this.pointerState.id!==this.pick(t)&&(this.pointerState.cancelled=!0)},this.renderer.domElement.addEventListener("pointerup",this.releaseGuard,{capture:!0})}dispose(){this.disposed||(this.renderer.domElement.removeEventListener("pointerup",this.releaseGuard,{capture:!0}),super.dispose())}};function hw(s){let t=Math.sin(s*127.1+311.7)*43758.5453;return t-Math.floor(t)}function uw(s){let t=document.createElement("canvas");t.width=t.height=128;let e=t.getContext("2d");e.font=`600 ${s>9?72:100}px ui-monospace, SFMono-Regular, Menlo, monospace`,e.textAlign="center",e.textBaseline="middle",e.shadowColor="#07151d",e.shadowBlur=1,e.fillStyle=["#b9ecec","#b6dbb9","#f4cd9a","#c8c3f1","#efaea7","#9bd5dd","#e5d7b7","#f0ebe3"][s-1]||"#d8d6c7",e.fillText(String(s),64,69);let i=new fn(t);return i.colorSpace=Be,i}function T0({resolution:s=6,irregularity:t=.45,shape:e="stepped",seed:i=1}={}){if(!Number.isInteger(s)||s<4||s>12)throw new RangeError("Resolution must be an integer between 4 and 12");if(!Number.isFinite(t)||t<0||t>1)throw new RangeError("Irregularity must be a finite number between 0 and 1");if(!["cube","stepped","terrace"].includes(e))throw new RangeError("Shape must be cube, stepped, or terrace");if(!Number.isSafeInteger(i))throw new RangeError("Seed must be a safe integer");let n=s,r=pw(i),a=dw(n,t,e,r),o=w0[Math.floor(r()*w0.length)],l=[1.25,.9,1.5],c=Math.hypot(...l),h=o.axes.map((M,S)=>o.signs[S]*l[M]/c),d=new Uint8Array(n**3),u=(M,S,A)=>M+n*(S+n*A);for(let M=0;M<n;M+=1)for(let S=0;S<n;S+=1)for(let A=0;A<a[S+n*M];A+=1){let v=[S,A,M],E=o.axes.map((P,I)=>o.signs[I]>0?v[P]:n-1-v[P]);d[u(...E)]=1}let f=(M,S,A)=>M>=0&&M<n&&S>=0&&S<n&&A>=0&&A<n&&d[u(M,S,A)]===1,p=new Array(6*n*n),_=new Map,g=new Map,m=0,y=M=>{let S=M.join(",");if(!_.has(S)){let A=M.map(v=>v-n/2);_.set(S,A),m=Math.max(m,Math.hypot(...A))}return _.get(S)};for(let M=0;M<n;M+=1)for(let S=0;S<n;S+=1)for(let A=0;A<n;A+=1)if(f(A,S,M))for(let v=0;v<S0.length;v+=1){let E=S0[v];if(f(A+E[0],S+E[1],M+E[2]))continue;let{u:P,v:I,corners:F}=fw(v,A,S,M,n),B=v*n*n+I*n+P;if(p[B])throw new Error("Surface direction atlas contains an overlapping tile");let D=F.map(y),z=D[0].map((X,W)=>(X+D[2][W])/2);p[B]={id:B,x:P,y:v*n+I,face:v,u:P,v:I,center:z,normal:[...E],corners:D,patch:[D[0],D[1],D[3],D[2]],patchSize:2,neighbors:[]};for(let X of F){let W=X.join(",");g.has(W)||g.set(W,[]),g.get(W).push(B)}}if(p.includes(void 0))throw new Error("Surface direction atlas contains a missing tile");let w=p.map(()=>new Set);for(let M of g.values())for(let S of M)for(let A of M)A!==S&&w[S].add(A);let x=0;for(let M of p)M.neighbors=[...w[M.id]].sort((S,A)=>S-A),x=Math.max(x,M.neighbors.length);return E0({kind:"surface",resolution:s,width:n,height:6*n,cellCount:p.length,shape:e,seed:i,irregularity:t,radius:m,surfaceArea:p.length,patchSize:2,maxDegree:x,viewDirection:h,cells:p})}function dw(s,t,e,i){let n=new Uint8Array(s*s).fill(s);if(e==="cube"||t===0)return n;let r=Math.max(1,Math.round(t*(s-1))),a=e==="stepped"?Math.min(r,i()<.6?1:2):Math.min(r,Math.max(2,Math.ceil(s/2))),o=Math.max(1,Math.floor(s*(.65-t*.4))),l=Math.max(1,Math.floor(s*.25)),c=Math.min(s-1,o+Math.floor(i()*l)),h=Math.min(s-1,o+Math.floor(i()*l));for(let d=0;d<a;d+=1){let u=c+Math.floor(d*(s-c)/a),f=h+Math.floor(d*(s-h)/a),p=Math.floor(r/a)+(d<r%a?1:0);for(let _=f;_<s;_+=1)for(let g=u;g<s;g+=1)n[g+s*_]-=p}return n}function fw(s,t,e,i,n){switch(s){case 0:return{u:n-1-i,v:e,corners:[[t+1,e,i+1],[t+1,e,i],[t+1,e+1,i],[t+1,e+1,i+1]]};case 1:return{u:i,v:e,corners:[[t,e,i],[t,e,i+1],[t,e+1,i+1],[t,e+1,i]]};case 2:return{u:t,v:n-1-i,corners:[[t,e+1,i+1],[t+1,e+1,i+1],[t+1,e+1,i],[t,e+1,i]]};case 3:return{u:t,v:i,corners:[[t,e,i],[t+1,e,i],[t+1,e,i+1],[t,e,i+1]]};case 4:return{u:t,v:e,corners:[[t,e,i+1],[t+1,e,i+1],[t+1,e+1,i+1],[t,e+1,i+1]]};default:return{u:n-1-t,v:e,corners:[[t+1,e,i],[t,e,i],[t,e+1,i],[t+1,e+1,i]]}}}function pw(s){let t=(s^Math.floor(s/4294967296)^2654435769)>>>0;return()=>{t=t+1831565813>>>0;let e=Math.imul(t^t>>>15,t|1);return e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function E0(s){if(s&&typeof s=="object"&&!Object.isFrozen(s)){for(let t of Object.values(s))E0(t);Object.freeze(s)}return s}var S0=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],w0=[{axes:[0,1,2],signs:[1,1,1]},{axes:[2,1,0],signs:[1,1,-1]},{axes:[0,1,2],signs:[-1,1,-1]},{axes:[2,1,0],signs:[-1,1,1]}];var np={beginner:{width:9,height:9,mines:10},intermediate:{width:16,height:16,mines:40},expert:{width:30,height:16,mines:99}},R0=["Right","Left","Up","Down","Front","Back"],j=s=>document.getElementById(s),sp=["localhost","127.0.0.1"].includes(location.hostname)&&new URLSearchParams(location.search).get("test")==="1",Li=new zu,on=j("scene-stage"),ut,Re,Vu=np.beginner,uc=np.beginner,Hu=null,mw=14863,P0=!1,I0="plane",Gu="beginner",ps="reveal",Je=0,Wu=0,ka=0,ep="ready",Xu=!1,qu=null,A0,lr=[];function cr(s=Vu){Li.reset(),Vu={...s},ut=new dr(sp?{...Vu,random:yw()}:Vu),Je=Math.floor(ut.height/2)*ut.width+Math.floor(ut.width/2),ka=0,Wu=0,ep="ready",Zu("reveal"),gw(),xw();let t=ut.topology?"surface":"plane";P0&&t!==I0?L0():Re?.rebuild(ut.snapshot()),j("top-view").setAttribute("aria-pressed",String(Re?.topView??!1)),j("result-panel").hidden=!0,Yu(),U0(),j("timer").textContent="00:00",j("cell-readout").textContent="Choose a tile to begin"}function gw(){let s=!!ut.topology;document.body.dataset.boardMode=s?"surface":"plane",j("board-mode").value=s?"surface":"plane",j("plane-settings").hidden=s,j("surface-settings").hidden=!s;let t=ut.topology;j("surface-current").textContent=s?`${t.cellCount} tiles \xB7 ${ut.mines} cores \xB7 Seed ${t.seed}`:"",j("surface-summary").textContent=s?`${t.cellCount} equal tiles \xB7 ${Math.round(t.irregularity*100)}% cuts`:"216 equal tiles \xB7 45% cuts",document.querySelector(".mission-intro h1").innerHTML=s?"Every face.<span>One solid puzzle.</span>":"Chart the <span>unknown.</span>",document.querySelector(".mission-description").innerHTML=s?"Read the edges.<br />Find the safe path around every corner.":"A dormant relic.<br />Every number points to safety.",on.setAttribute("aria-label",s?"Faceted minesweeper solid. Drag to orbit every side. Arrow keys follow neighboring tiles; Enter explores; F marks.":"3D minesweeper board. Arrow keys select; Enter explores; F marks; V toggles top view.")}function L0(){P0=!0,Re?.dispose(),Re=null,Xu=!1,I0=ut.topology?"surface":"plane",on.classList.remove("fallback-active"),j("fallback-board").hidden=!0;let s=j("board-accessibility");document.querySelector(".scene-section").appendChild(s),s.classList.add("sr-only"),j("reset-camera").disabled=!1,j("top-view").disabled=!1;try{let t=ut.topology?ku:za;Re=new t(on,{onReveal:e=>ms("reveal",e),onFlag:e=>ms("flag",e),onChord:e=>ms("chord",e),onHover:ap,onFailure:C0,onExplosion:e=>Li.playExplosion(e),onFirework:(e,i)=>Li.playFirework(e,i),onFireworksStop:()=>Li.stopFireworks(),onChainComplete:()=>{ut.status==="lost"&&(Yu(),rp())}}),Re.rebuild(ut.snapshot()),Re.setMode(ps),j("scene-status").hidden=!0}catch(t){C0(t)}}function D0(){let s=j("surface-shape").value;return{shape:s,resolution:Number(j("surface-area").value),irregularity:s==="cube"?0:Number(j("surface-irregularity").value)/100,density:Number(j("surface-density").value)}}function _w(){let s=D0(),t=6*s.resolution**2;j("surface-area-value").textContent=`${t} tiles`,j("surface-area").setAttribute("aria-valuetext",`${t} tiles`),j("surface-irregularity-value").textContent=s.shape==="cube"?"Off":`${Math.round(s.irregularity*100)}%`,j("surface-irregularity").disabled=s.shape==="cube",j("surface-relief-hint").textContent=s.shape==="cube"?"A regular cube has no corner cuts.":"Deeper steps. Equal square tiles.",j("surface-density-value").textContent=`${s.density}% \xB7 ${Math.floor(t*s.density/100)} cores`,j("surface-draft-note").textContent="Generate to apply these settings. Your current field stays unchanged."}function N0(){let s=D0(),t=sp?++mw:crypto.getRandomValues(new Uint32Array(1))[0],e=T0({...s,seed:t});return{topology:e,mines:Math.floor(e.cellCount*s.density/100)}}function ms(s,t){if(!Number.isInteger(t)||t<0||t>=ut.cells.length)return;if(s==="flag"&&ut.status==="ready"){op("Explore a tile before marking suspected cores.");return}let e=ut.status,i=s==="flag"?ut.toggleFlag(t):s==="chord"?ut.chord(t):ut.reveal(t);i.action!=="noop"&&(e==="ready"&&(Wu=performance.now(),ut.topology&&(j("surface-generator").open=!1)),ka=Math.min(999,Math.floor((performance.now()-Wu)/1e3)),Re?.update(ut.snapshot(),i),Yu(),U0(i.changed),ap(t),Li.setMood(ut.status),(i.action!=="lose"||!Re)&&Li.play(i.action),ut.status!==ep&&["won","lost"].includes(ut.status)&&(ut.status==="lost"&&Re?.detonation.active?(j("status-label").textContent="Chain reaction",j("status-description").textContent="The blast is spreading. Cores will detonate one by one."):rp()),ep=ut.status)}function Yu(){j("mine-counter").textContent=String(ut.mines-ut.flagCount).padStart(2,"0");let s=Math.round(ut.revealedCount/(ut.cells.length-ut.mines)*100);j("progress-value").textContent=`${s}%`,j("progress-fill").style.width=`${s}%`,j("progress-fill").parentElement?.setAttribute("aria-valuenow",String(s));let t={ready:["Ready to explore","Choose any tile. Your first move and its neighbors are safe."],playing:["Survey in progress","Numbers count cores in the eight neighboring tiles. Mark suspected cores."],won:["Sector cleared","All safe tiles explored. Every core is marked."],lost:["Core triggered","Review the revealed cores, then start a new survey."]}[ut.status];ut.topology&&ut.status==="playing"&&(t[1]="Numbers count touching tiles across the surface. Rotate to explore every side."),ut.topology&&ut.status==="ready"&&(t[1]="Choose any tile. Hover to see its neighbors; drag to explore every side."),j("status-label").textContent=t[0],j("status-description").textContent=t[1],document.body.dataset.gameState=ut.status,j("sector-size")&&(j("sector-size").textContent=ut.topology?`${ut.cells.length} surface tiles`:`${ut.width} \xD7 ${ut.height}`),j("sector-mines")&&(j("sector-mines").textContent=`${ut.mines} cores`)}function rp(){let s=ut.status==="won";j("result-title").textContent=s?"Silence restored.":"Survey interrupted.",j("result-description").textContent=s?`All ${ut.revealedCount} safe tiles explored in ${ip(ka)}.`:`${ut.revealedCount} safe tiles explored in ${ip(ka)}. All core locations are now visible.`,j("result-panel").hidden=!1,j("result-panel").dataset.outcome=ut.status,op(s?"Survey complete \xB7 all safe tiles explored":"Core triggered \xB7 full layout revealed")}function Zu(s){ps=s,Re?.setMode(ps),j("reveal-mode").setAttribute("aria-pressed",String(ps==="reveal")),j("flag-mode").setAttribute("aria-pressed",String(ps==="flag")),document.body.dataset.inputMode=ps}function ap(s){if(s<0||!ut?.cells[s]){j("cell-readout").textContent=ut?.status==="ready"?"Choose a tile to begin":"Drag to orbit \xB7 Scroll to zoom";return}let t=ut.snapshot().cells[s],e=t.revealed?t.mine?"Unstable core":t.adjacent?`${t.adjacent} nearby core${t.adjacent===1?"":"s"}`:"Safe tile":t.flagged?"Marked":"Unexplored";j("cell-readout").textContent=ut.topology?`Tile ${t.id+1} / ${e} \xB7 ${ut.neighbors(s).length} neighbors`:`${String(t.x+1).padStart(2,"0")} : ${String(t.y+1).padStart(2,"0")} / ${e}`}function xw(){let s=j("board-accessibility");s.innerHTML="",s.setAttribute("role","grid"),s.setAttribute("aria-label",ut.topology?"Faceted minesweeper solid. Arrow keys follow touching tiles across faces. Enter explores and F marks.":"Minesweeper grid. Use the arrow keys to select a tile, Enter to explore, and F to mark."),s.setAttribute("aria-rowcount",String(ut.height)),s.setAttribute("aria-colcount",String(ut.width)),s.style.setProperty("--columns",ut.width),lr=[];for(let t=0;t<ut.height;t++){if(ut.topology&&t%ut.topology.resolution===0){let i=document.createElement("div");i.className="surface-face-label",i.setAttribute("role","presentation"),i.textContent=`${R0[Math.floor(t/ut.topology.resolution)]}-facing tiles`,s.appendChild(i)}let e=document.createElement("div");e.setAttribute("role","row");for(let i=0;i<ut.width;i++){let n=t*ut.width+i,r=document.createElement("button");r.type="button",r.dataset.cellId=String(n),r.setAttribute("role","gridcell"),ut.topology&&(r.dataset.face=String(ut.topology.cells[n].face)),r.setAttribute("aria-rowindex",String(t+1)),r.setAttribute("aria-colindex",String(i+1)),r.tabIndex=n===Je?0:-1,r.addEventListener("click",()=>ms(ps,n)),r.addEventListener("contextmenu",a=>{a.preventDefault(),ms("flag",n)}),r.addEventListener("dblclick",()=>ms("chord",n)),r.addEventListener("focus",()=>hc(n,!1)),lr.push(r),e.appendChild(r)}s.appendChild(e)}}function U0(s=ut.cells.map(t=>t.id)){let t=ut.snapshot();for(let e of s){let i=t.cells[e],n=lr[e],r=i.wrongFlag?"Incorrect mark":i.revealed?i.mine?"Unstable core":`${i.adjacent} nearby core${i.adjacent===1?"":"s"}`:i.flagged?"Marked":"Unexplored";n.setAttribute("aria-label",ut.topology?`${R0[i.face]}-facing tile ${i.id+1}: ${r}. Neighbors ${ut.neighbors(e).map(a=>a+1).join(", ")}.`:`Row ${i.y+1}, column ${i.x+1}: ${r}`),n.dataset.state=i.wrongFlag?"wrong":i.revealed?i.mine?"mine":"revealed":i.flagged?"flagged":"covered",n.textContent=i.wrongFlag?"\xD7":i.revealed?i.mine?"\u2726":i.adjacent||"\xB7":i.flagged?"\u25B2":""}}function hc(s,t=!0){if(lr[Je]?.setAttribute("tabindex","-1"),Je=s,lr[Je].tabIndex=0,Re?.focus(Je),ap(Je),ut.topology){let e=new Set(ut.neighbors(Je));for(let i of lr)i.dataset.neighbor=String(e.has(Number(i.dataset.cellId)))}t&&lr[Je].focus({preventScroll:!Xu})}function vw(s,t){let e={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[t],i=ut.topology,n=i.cells[s],r=Re?.projectCell(s),a=_=>_.map((g,m)=>g-n.corners[0][m]),o=a(n.corners[1]),l=a(n.corners[3]),c=_=>{let g=Math.hypot(..._)||1;return _.map(m=>m/g)},h=c(o),d=c(l),u=(_,g)=>_.reduce((m,y,w)=>m+y*g[w],0),f=s,p=-1/0;for(let _ of ut.neighbors(s)){let g,m;if(Re&&r){let M=Re.projectCell(_);g=M.x-r.x,m=M.y-r.y}else{let M=i.cells[_].center.map((S,A)=>S-n.center[A]);g=u(M,h),m=u(M,d)}let y=Math.hypot(g,m);if(!y)continue;let w=g*e[0]+m*e[1];if(w<=0)continue;let x=w/y-y*1e-4;x>p&&(f=_,p=x)}return f}function C0(s){Xu||(Xu=!0,console.warn("3D rendering unavailable; accessible grid enabled.",s?.message||""),Re?.dispose(),Re=null,on.classList.add("fallback-active"),j("fallback-board").hidden=!1,j("fallback-board").appendChild(j("board-accessibility")),j("board-accessibility").classList.remove("sr-only"),j("scene-status").textContent="3D unavailable \xB7 The grid is ready to play.",ut?.topology&&(j("scene-status").textContent="3D unavailable \xB7 Direction atlas enabled. Neighbors still connect across faces."),j("scene-status").hidden=!1,j("reset-camera").disabled=!0,j("top-view").disabled=!0,ut?.status==="lost"&&(Yu(),rp()))}function op(s){clearTimeout(A0),j("toast").textContent=s,j("toast").hidden=!1,A0=setTimeout(()=>{j("toast").hidden=!0},3200)}function dc(s){return ut.status!=="playing"?Promise.resolve(!0):qu?Promise.resolve(!1):(j("confirm-title").textContent="Start a new survey?",j("confirm-description").textContent=s,j("confirm-dialog").showModal(),new Promise(t=>{qu=t}))}function lp(s){let t=qu;qu=null,j("confirm-dialog").close(),t?.(s)}async function cp(){await dc("This will reset the board, marks, and timer.")&&cr()}function ip(s){return`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`}function yw(){let s=7127;return()=>(s=s*1664525+1013904223>>>0,s/4294967296)}document.addEventListener("pointerdown",()=>{Re?.clearFocus(),Li.unlock()},{capture:!0});document.addEventListener("pointerup",()=>{Li.unlock()},{capture:!0});document.addEventListener("keydown",()=>{Li.unlock()},{capture:!0});j("reveal-mode").addEventListener("click",()=>Zu("reveal"));j("flag-mode").addEventListener("click",()=>Zu("flag"));j("new-game").addEventListener("click",cp);j("result-restart").addEventListener("click",cp);j("reset-camera").addEventListener("click",()=>Re?.resetCamera());j("top-view").addEventListener("click",()=>{let s=j("top-view").getAttribute("aria-pressed")!=="true";j("top-view").setAttribute("aria-pressed",String(s)),Re?.setTopView(s)});j("sound-toggle").addEventListener("click",()=>{let s=j("sound-toggle").getAttribute("aria-pressed")!=="true";j("sound-toggle").setAttribute("aria-pressed",String(s)),j("sound-toggle").setAttribute("aria-label",s?"Mute sound effects":"Unmute sound effects"),j("sound-toggle").title=s?"Mute sound effects":"Unmute sound effects";let t=j("sound-toggle").querySelector("[data-sound-label]");t&&(t.textContent=s?"Sound on":"Sound off"),Li.setEnabled(s),Li.play("flag")});j("music-toggle").addEventListener("click",()=>{let s=j("music-toggle").getAttribute("aria-pressed")!=="true";j("music-toggle").setAttribute("aria-pressed",String(s)),j("music-toggle").setAttribute("aria-label",s?"Mute music":"Unmute music"),j("music-toggle").title=s?"Mute music":"Unmute music",Li.setMusicEnabled(s)});j("help-btn").addEventListener("click",()=>j("help-dialog").showModal());document.querySelectorAll("[data-close-dialog]").forEach(s=>s.addEventListener("click",()=>s.closest("dialog").close()));j("confirm-accept").addEventListener("click",()=>lp(!0));j("confirm-cancel").addEventListener("click",()=>lp(!1));j("confirm-dialog").addEventListener("cancel",s=>{s.preventDefault(),lp(!1)});j("settings-btn").addEventListener("click",()=>{let s=j("settings-panel");s.hidden=!s.hidden,j("settings-btn").setAttribute("aria-expanded",String(!s.hidden)),s.hidden||j("board-mode").focus()});j("preset-select").addEventListener("change",async()=>{let s=j("preset-select").value;j("custom-inputs").hidden=s!=="custom",j("config-error").textContent="",s!=="custom"&&(await dc("Changing sectors will reset your current survey.")?(Gu=s,uc=np[s],cr(uc)):(j("preset-select").value=Gu,j("custom-inputs").hidden=Gu!=="custom"))});j("apply-btn").addEventListener("click",async()=>{let s={width:Number(j("custom-width").value),height:Number(j("custom-height").value),mines:Number(j("custom-mines").value)};try{new dr(s)}catch(t){j("config-error").textContent=t.message;return}j("config-error").textContent="",await dc("Applying these settings will reset your current survey.")&&(Gu="custom",uc=s,cr(uc))});j("surface-generator").open=matchMedia("(min-width: 761px)").matches;for(let s of["surface-shape","surface-area","surface-irregularity","surface-density"])j(s).addEventListener("input",_w);j("board-mode").addEventListener("change",async()=>{let s=j("board-mode").value,t=ut.topology?"surface":"plane";if(s!==t){if(!await dc("Changing the field type will start a new survey.")){j("board-mode").value=t;return}try{s==="surface"?(Hu||=N0(),cr(Hu)):cr(uc)}catch(e){j("board-mode").value=t,j("config-error").textContent=e.message,op(e.message)}}});j("surface-generate").addEventListener("click",async()=>{if(await dc("Generating a new solid will reset this survey, marks, and timer."))try{let s=N0();new dr(s),j("surface-error").textContent="",Hu=s,cr(Hu),j("surface-draft-note").textContent="New solid ready. Equal squares on every face.",matchMedia("(max-width: 760px)").matches&&(j("surface-generator").open=!1)}catch(s){j("surface-error").textContent=s.message}});on.tabIndex=0;on.setAttribute("role","group");on.setAttribute("aria-label","3D minesweeper board. Arrow keys select; Enter explores; F marks; V toggles top view.");on.addEventListener("focus",()=>{on.matches(":focus-visible")&&Re?.focus(Je)});on.addEventListener("focusout",s=>{s.relatedTarget?.closest?.("#board-accessibility")||Re?.clearFocus()});document.addEventListener("keydown",s=>{if(s.isComposing||s.altKey||s.ctrlKey||s.metaKey||document.querySelector("dialog[open]")||s.target.closest('input, select, textarea, [contenteditable="true"]'))return;let t=s.target===on||s.target.closest("#board-accessibility");if(t&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(s.key)){if(s.preventDefault(),ut.topology){hc(vw(Je,s.key));return}let e=Je%ut.width,i=Math.floor(Je/ut.width),n=Math.max(0,Math.min(ut.width-1,e+(s.key==="ArrowRight"?1:s.key==="ArrowLeft"?-1:0))),r=Math.max(0,Math.min(ut.height-1,i+(s.key==="ArrowDown"?1:s.key==="ArrowUp"?-1:0)));hc(r*ut.width+n)}else t&&["Enter"," "].includes(s.key)?(s.preventDefault(),hc(Je,!1),ms(ut.cells[Je].revealed?"chord":ps,Je)):t&&s.key.toLowerCase()==="f"?(s.preventDefault(),hc(Je,!1),ms("flag",Je)):s.key.toLowerCase()==="v"?j("top-view").click():s.key.toLowerCase()==="r"?(s.preventDefault(),cp()):s.key==="Escape"&&Zu("reveal")});cr();L0();setInterval(()=>{ut.status==="playing"&&(ka=Math.min(999,Math.floor((performance.now()-Wu)/1e3))),j("timer").textContent=ip(ka)},250);sp&&(window.__surveyTest={getGame:()=>ut,getScene:()=>Re,getAudio:()=>Li});})();
/*! For license information please see explorer.js.LEGAL.txt */
